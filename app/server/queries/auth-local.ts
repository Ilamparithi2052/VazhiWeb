import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import * as jose from "jose";
import { env } from "../lib/env";

/* ------------------------------------------------------------------ */
/* password hashing — scrypt, stored as "saltHex:hashHex"              */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

/* ------------------------------------------------------------------ */
/* TOTP (RFC 6238) — compatible with Google Authenticator, Authy, 1Password */
/* ------------------------------------------------------------------ */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  const bytes = randomBytes(20);
  let out = "";
  for (const b of bytes) out += B32[b % 32];
  return out;
}

function b32decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpAt(secret: string, counter: number): string {
  const key = b32decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(buf).digest();
  const off = h[h.length - 1] & 0xf;
  const code = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

/** accepts the current 30s window ±1 step (clock drift tolerance) */
export function verifyTotp(secret: string, code: string): boolean {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Math.floor(Date.now() / 1000 / 30);
  for (const c of [now - 1, now, now + 1]) {
    if (totpAt(secret, c) === clean) return true;
  }
  return false;
}

/** otpauth:// URI — the frontend renders this as a QR code */
export function totpUri(secret: string, email: string): string {
  const issuer = "Vazhi";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;
}

/* ------------------------------------------------------------------ */
/* Google sign-in — verify the ID token from Google Identity Services  */
/* ------------------------------------------------------------------ */

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, string>;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
    if (clientId && data.aud !== clientId) {
      console.warn("[auth] Google token audience mismatch");
      return null;
    }
    if (data.email_verified !== "true") return null;
    return { sub: data.sub, email: data.email, name: data.name || data.email, picture: data.picture };
  } catch (e) {
    console.warn("[auth] Google token verification failed:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* pending-2FA token — short-lived JWT handed out after a correct       */
/* password (or Google sign-in) when TOTP is enabled; exchanged for a   */
/* full session only after the authenticator code checks out            */
/* ------------------------------------------------------------------ */

const PENDING_SCOPE = "totp-pending";

export async function signPendingToken(unionId: string): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT({ unionId, clientId: "web", scope: PENDING_SCOPE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);
}

export async function verifyPendingToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.scope !== PENDING_SCOPE || !payload.unionId) return null;
    return payload.unionId as string;
  } catch {
    return null;
  }
}

/** cheap fingerprint for rate-limit-ish logging without storing IPs */
export function fingerprint(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 12);
}

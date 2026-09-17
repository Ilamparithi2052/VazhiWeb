import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import {
  countLocalUsers,
  findUserByUnionId,
  updateUserAuth,
  upsertUser,
} from "./queries/users";
import {
  generateTotpSecret,
  hashPassword,
  signPendingToken,
  totpUri,
  verifyGoogleIdToken,
  verifyPassword,
  verifyPendingToken,
  verifyTotp,
} from "./queries/auth-local";

/** email/password accounts are keyed "email:{address}", Google accounts "google:{sub}" */
const emailUid = (email: string) => `email:${email.toLowerCase().trim()}`;
const googleUid = (sub: string) => `google:${sub}`;

function sessionCookie(headers: Headers, token: string): string {
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(Session.cookieName, token, {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
    secure: opts.secure,
    maxAge: Session.maxAgeMs / 1000,
  });
}

/** issues a session for a verified identity, or a pending token when 2FA is on */
async function completeSignIn(
  user: { unionId: string; totpEnabled: boolean; totpSecret: string | null },
  resHeaders: Headers,
  reqHeaders: Headers,
) {
  if (user.totpEnabled && user.totpSecret) {
    return { status: "totp" as const, pendingToken: await signPendingToken(user.unionId) };
  }
  const token = await signSessionToken({ unionId: user.unionId, clientId: "web" });
  resHeaders.append("set-cookie", sessionCookie(reqHeaders, token));
  return { status: "ok" as const };
}

export const authRouter = createRouter({
  /* never leak passwordHash / totpSecret to the client */
  me: authedQuery.query((opts) => {
    const { passwordHash: _ph, totpSecret: _ts, ...safe } = opts.ctx.user;
    return safe;
  }),

  /* -------------------------------------------------- */
  /* setup — is this a fresh install with no accounts?  */
  /* -------------------------------------------------- */
  setupStatus: publicQuery.query(async () => {
    const googleEnabled = Boolean(
      process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID,
    );
    // setup stays open until at least one account can actually sign in —
    // legacy OAuth-only rows (no password) don't count
    const needsSetup = googleEnabled
      ? false
      : (await countLocalUsers()) === 0;
    return { needsSetup, googleEnabled };
  }),

  createFirstAdmin: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(120),
        email: z.string().email().max(320),
        password: z.string().min(8).max(200),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const googleEnabled = Boolean(
        process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID,
      );
      if (googleEnabled || (await countLocalUsers()) > 0) {
        throw new Error("An account already exists — first-admin setup is closed.");
      }
      const email = input.email.toLowerCase().trim();
      await upsertUser({
        unionId: emailUid(email),
        name: input.name,
        email,
        role: "admin",
      } as never);
      await updateUserAuth(emailUid(email), { passwordHash: hashPassword(input.password) });
      const token = await signSessionToken({ unionId: emailUid(email), clientId: "web" });
      ctx.resHeaders.append("set-cookie", sessionCookie(ctx.req.headers, token));
      return { status: "ok" as const };
    }),

  /* -------------------------------------------------- */
  /* sign-in                                            */
  /* -------------------------------------------------- */
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string().min(1).max(200) }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByUnionId(emailUid(input.email));
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
        throw new Error("Invalid email or password.");
      }
      await upsertUser({ unionId: user.unionId } as never); // touch lastSignInAt
      return completeSignIn(user, ctx.resHeaders, ctx.req.headers);
    }),

  loginGoogle: publicQuery
    .input(z.object({ idToken: z.string().min(10) }))
    .mutation(async ({ input, ctx }) => {
      const profile = await verifyGoogleIdToken(input.idToken);
      if (!profile) throw new Error("Google sign-in could not be verified.");
      const uid = googleUid(profile.sub);
      await upsertUser({
        unionId: uid,
        name: profile.name,
        email: profile.email,
        avatar: profile.picture ?? null,
      } as never);
      const user = await findUserByUnionId(uid);
      if (!user) throw new Error("Sign-in failed.");
      return completeSignIn(user, ctx.resHeaders, ctx.req.headers);
    }),

  verifyTotp: publicQuery
    .input(z.object({ pendingToken: z.string().min(10), code: z.string().min(6).max(8) }))
    .mutation(async ({ input, ctx }) => {
      const unionId = await verifyPendingToken(input.pendingToken);
      if (!unionId) throw new Error("Sign-in expired — please log in again.");
      const user = await findUserByUnionId(unionId);
      if (!user?.totpEnabled || !user.totpSecret) throw new Error("2FA is not enabled.");
      if (!verifyTotp(user.totpSecret, input.code)) throw new Error("Wrong authenticator code.");
      const token = await signSessionToken({ unionId, clientId: "web" });
      ctx.resHeaders.append("set-cookie", sessionCookie(ctx.req.headers, token));
      return { status: "ok" as const };
    }),

  /* -------------------------------------------------- */
  /* 2FA management (signed-in users)                    */
  /* -------------------------------------------------- */
  totpStart: authedQuery.mutation(async ({ ctx }) => {
    const secret = generateTotpSecret();
    await updateUserAuth(ctx.user.unionId, { totpSecret: secret, totpEnabled: false });
    return {
      secret,
      uri: totpUri(secret, ctx.user.email ?? ctx.user.unionId),
    };
  }),

  totpConfirm: authedQuery
    .input(z.object({ code: z.string().min(6).max(8) }))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user?.totpSecret) throw new Error("Start 2FA setup first.");
      if (!verifyTotp(user.totpSecret, input.code)) throw new Error("Wrong code — try again.");
      await updateUserAuth(ctx.user.unionId, { totpEnabled: true });
      return { enabled: true };
    }),

  totpDisable: authedQuery
    .input(z.object({ code: z.string().min(6).max(8) }))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user?.totpSecret || !verifyTotp(user.totpSecret, input.code)) {
        throw new Error("Wrong code — 2FA stays on.");
      }
      await updateUserAuth(ctx.user.unionId, { totpEnabled: false, totpSecret: null });
      return { enabled: false };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});

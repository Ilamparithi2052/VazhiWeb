import { createHash, randomBytes } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { newsletterLogTable, subscribersTable } from "@db/schema";
import { getDb } from "./connection";
import { listPlaces, listStories } from "./content";

export interface SubscriberDTO {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: Date;
  sentCount: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const newToken = () => randomBytes(24).toString("hex");

export function hashSecret(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

/** Public subscribe — idempotent; re-subscribing an inactive email reactivates it. */
export async function subscribe(emailRaw: string, name?: string): Promise<{ ok: boolean }> {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false };
  const db = getDb();
  const existing = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
  if (existing.length > 0) {
    await db
      .update(subscribersTable)
      .set({ active: true, name: name?.trim() || existing[0].name })
      .where(eq(subscribersTable.id, existing[0].id));
  } else {
    await db.insert(subscribersTable).values({ email, name: name?.trim() || null, token: newToken() });
  }
  return { ok: true };
}

export async function unsubscribeByToken(token: string): Promise<string | null> {
  const db = getDb();
  const rows = await db.select().from(subscribersTable).where(eq(subscribersTable.token, token)).limit(1);
  if (rows.length === 0) return null;
  await db.update(subscribersTable).set({ active: false }).where(eq(subscribersTable.id, rows[0].id));
  return rows[0].email;
}

export async function listSubscribers(): Promise<SubscriberDTO[]> {
  const db = getDb();
  const subs = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.id));
  const logs = await db.select().from(newsletterLogTable);
  const counts = new Map<number, number>();
  for (const l of logs) counts.set(l.subscriberId, (counts.get(l.subscriberId) ?? 0) + 1);
  return subs.map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    active: s.active,
    createdAt: s.createdAt,
    sentCount: counts.get(s.id) ?? 0,
  }));
}

export async function removeSubscriber(id: number): Promise<void> {
  const db = getDb();
  await db.delete(newsletterLogTable).where(eq(newsletterLogTable.subscriberId, id));
  await db.delete(subscribersTable).where(eq(subscribersTable.id, id));
}

/** Bulk import from pasted text (one email per line, or "email, name"). Returns per-line outcome. */
export async function importSubscribers(text: string): Promise<{ added: number; skipped: number; invalid: number }> {
  let added = 0;
  let skipped = 0;
  let invalid = 0;
  const db = getDb();
  for (const line of text.split(/\r?\n/)) {
    const parts = line.split(/[,;\t]/).map((p) => p.trim()).filter(Boolean);
    const email = (parts[0] ?? "").toLowerCase();
    if (!email) continue;
    if (!EMAIL_RE.test(email)) {
      invalid++;
      continue;
    }
    const name = parts[1]?.trim() || null;
    const existing = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(subscribersTable).values({ email, name, token: newToken() });
    added++;
  }
  return { added, skipped, invalid };
}

/* ---------------------------------- digest ---------------------------------- */

export interface DigestItem {
  kind: "story" | "place";
  id: string;
  title: string;
  blurb: string;
  tag: string;
  url: string;
}

export interface DigestPlan {
  isFallback: boolean;
  items: DigestItem[];
  /** per-subscriber fallback picks: subscriberId -> item */
  personal: Record<number, DigestItem>;
}

const DAY = 24 * 60 * 60 * 1000;

function storyItem(s: { id: string; title: string; lede: string; tag: string }, base: string): DigestItem {
  return { kind: "story", id: s.id, title: s.title, blurb: s.lede, tag: s.tag, url: `${base}/stories/${s.id}` };
}
function placeItem(p: { id: string; name: string; summary: string; region: string }, base: string): DigestItem {
  return { kind: "place", id: p.id, title: p.name, blurb: p.summary, tag: p.region, url: `${base}/place/${p.id}` };
}

/**
 * Build this week's digest: anything published in the last 7 days, capped at 6.
 * If nothing is new, pick one random story per subscriber excluding everything
 * already in their newsletter log (falls back to places, then to any story).
 */
export async function buildDigest(siteBase: string): Promise<DigestPlan | null> {
  const since = new Date(Date.now() - 7 * DAY);
  const stories = await listStories(true);
  const places = await listPlaces(true);
  const freshStories = stories.filter((s) => s.publishedAt && s.publishedAt >= since);
  const freshPlaces = places.filter((p) => p.publishedAt && p.publishedAt >= since);
  const items: DigestItem[] = [
    ...freshStories.map((s) => storyItem(s, siteBase)),
    ...freshPlaces.map((p) => placeItem(p, siteBase)),
  ].slice(0, 6);

  if (items.length > 0) return { isFallback: false, items, personal: {} };

  const db = getDb();
  const subs = await db
    .select()
    .from(subscribersTable)
    .where(and(eq(subscribersTable.active, true)));
  if (subs.length === 0) return null;

  const logs = await db.select().from(newsletterLogTable);
  const sentBy = new Map<number, Set<string>>();
  for (const l of logs) {
    if (!sentBy.has(l.subscriberId)) sentBy.set(l.subscriberId, new Set());
    sentBy.get(l.subscriberId)!.add(`${l.kind}:${l.refId}`);
  }

  const personal: Record<number, DigestItem> = {};
  const allStories = stories.map((s) => storyItem(s, siteBase));
  const allPlaces = places.map((p) => placeItem(p, siteBase));
  for (const sub of subs) {
    const sent = sentBy.get(sub.id) ?? new Set<string>();
    const pickFrom = (pool: DigestItem[]) => pool.filter((i) => !sent.has(`${i.kind}:${i.id}`));
    let pool = pickFrom(allStories);
    if (pool.length === 0) pool = pickFrom(allPlaces);
    if (pool.length === 0) pool = allStories; // everything sent — restart the cycle
    if (pool.length === 0) continue;
    personal[sub.id] = pool[Math.floor(Math.random() * pool.length)];
  }
  return { isFallback: true, items: [], personal };
}

/** Record every item sent so the no-repeat guarantee holds across weeks. */
export async function logSends(plan: DigestPlan, subs: { id: number }[]): Promise<void> {
  const db = getDb();
  if (plan.isFallback) {
    for (const [sid, item] of Object.entries(plan.personal)) {
      await db.insert(newsletterLogTable).values({ subscriberId: Number(sid), kind: item.kind, refId: item.id });
    }
  } else {
    for (const sub of subs) {
      for (const item of plan.items) {
        await db.insert(newsletterLogTable).values({ subscriberId: sub.id, kind: item.kind, refId: item.id });
      }
    }
  }
}

/* --------------------------------- sending ---------------------------------- */

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderEmail(item: DigestItem, unsubUrl: string, opts: { isFallback: boolean }): string {
  const heading = opts.isFallback ? "From the Vazhi archive" : "New in the atlas";
  const sub = opts.isFallback
    ? "Nothing new was added this week — here is a piece from the archive we think you'll love."
    : "Fresh places and stories were added to Vazhi this week.";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#120d08;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:Georgia,'Times New Roman',serif;color:#f0e6d2;">
  <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a15a;margin:0 0 8px;">${heading}</p>
  <p style="font-size:13px;color:#a99c84;margin:0 0 28px;">${sub}</p>
  <div style="border:1px solid rgba(201,161,90,0.3);border-radius:12px;padding:28px;background:#1a140d;">
    <p style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a15a;margin:0 0 10px;">${esc(item.tag)} · ${item.kind === "story" ? "Story" : "Place"}</p>
    <h1 style="font-size:26px;line-height:1.25;margin:0 0 12px;color:#f8f1e2;font-weight:normal;">${esc(item.title)}</h1>
    <p style="font-size:14px;line-height:1.7;color:#cfc3ac;margin:0 0 22px;">${esc(item.blurb.slice(0, 260))}${item.blurb.length > 260 ? "…" : ""}</p>
    <a href="${item.url}" style="display:inline-block;background:#c9a15a;color:#120d08;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:12px 26px;border-radius:999px;font-family:Arial,sans-serif;">Read on Vazhi</a>
  </div>
  <p style="font-size:11px;color:#7d7160;margin:28px 0 0;line-height:1.7;font-family:Arial,sans-serif;">
    You're receiving this because you subscribed to Vazhi letters.<br/>
    <a href="${unsubUrl}" style="color:#c9a15a;">Unsubscribe instantly</a>
  </p>
</div>
</body></html>`;
}

export function renderDigestEmail(items: DigestItem[], unsubUrl: string): string {
  const cards = items
    .map(
      (item) => `
  <div style="border:1px solid rgba(201,161,90,0.3);border-radius:12px;padding:24px;background:#1a140d;margin-bottom:16px;">
    <p style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a15a;margin:0 0 8px;">${esc(item.tag)} · ${item.kind === "story" ? "Story" : "Place"}</p>
    <h2 style="font-size:21px;line-height:1.3;margin:0 0 8px;color:#f8f1e2;font-weight:normal;">${esc(item.title)}</h2>
    <p style="font-size:13px;line-height:1.65;color:#cfc3ac;margin:0 0 16px;">${esc(item.blurb.slice(0, 200))}${item.blurb.length > 200 ? "…" : ""}</p>
    <a href="${item.url}" style="color:#c9a15a;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;font-family:Arial,sans-serif;">Read more →</a>
  </div>`,
    )
    .join("");
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#120d08;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:Georgia,'Times New Roman',serif;color:#f0e6d2;">
  <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a15a;margin:0 0 8px;">New in the atlas</p>
  <p style="font-size:13px;color:#a99c84;margin:0 0 28px;">Fresh places and stories were added to Vazhi this week.</p>
  ${cards}
  <p style="font-size:11px;color:#7d7160;margin:28px 0 0;line-height:1.7;font-family:Arial,sans-serif;">
    You're receiving this because you subscribed to Vazhi letters.<br/>
    <a href="${unsubUrl}" style="color:#c9a15a;">Unsubscribe instantly</a>
  </p>
</div>
</body></html>`;
}

interface SendResult {
  sent: number;
  failed: number;
  error?: string;
}

/** Send the digest to every active subscriber via Resend. */
export async function sendDigest(opts: {
  apiKey: string;
  from: string;
  siteBase: string;
  plan: DigestPlan;
}): Promise<SendResult> {
  const db = getDb();
  const subs = await db.select().from(subscribersTable).where(eq(subscribersTable.active, true));
  if (subs.length === 0) return { sent: 0, failed: 0, error: "no active subscribers" };

  let sent = 0;
  let failed = 0;
  let lastError: string | undefined;
  for (const sub of subs) {
    const unsubUrl = `${opts.siteBase}/api/newsletter/unsubscribe/${sub.token}`;
    let subject: string;
    let html: string;
    if (opts.plan.isFallback) {
      const item = opts.plan.personal[sub.id];
      if (!item) continue;
      subject = `From the archive: ${item.title}`;
      html = renderEmail(item, unsubUrl, { isFallback: true });
    } else {
      subject = opts.plan.items.length === 1 ? `New this week: ${opts.plan.items[0].title}` : `Vazhi: ${opts.plan.items.length} new additions this week`;
      html = renderDigestEmail(opts.plan.items, unsubUrl);
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: opts.from, to: sub.email, subject, html }),
      });
      if (res.ok) {
        sent++;
        if (opts.plan.isFallback) {
          const item = opts.plan.personal[sub.id];
          await db.insert(newsletterLogTable).values({ subscriberId: sub.id, kind: item.kind, refId: item.id });
        }
      } else {
        failed++;
        lastError = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
      }
    } catch (e) {
      failed++;
      lastError = String(e).slice(0, 200);
    }
  }
  if (!opts.plan.isFallback && sent > 0) {
    for (const sub of subs) {
      for (const item of opts.plan.items) {
        await db.insert(newsletterLogTable).values({ subscriberId: sub.id, kind: item.kind, refId: item.id });
      }
    }
  }
  return { sent, failed, error: lastError };
}

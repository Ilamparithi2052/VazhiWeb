import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
/* serves uploaded custom fonts (base64 in DB) with long-cache headers */
app.get("/api/fonts/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: "Not Found" }, 404);
  const { getFontData } = await import("./queries/content");
  const f = await getFontData(id);
  if (!f) return c.json({ error: "Not Found" }, 404);
  return c.body(Buffer.from(f.data, "base64"), 200, {
    "Content-Type": f.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

/* serves uploaded media library images (base64 in DB) with long-cache headers */
app.get("/api/media/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: "Not Found" }, 404);
  const { getMediaData } = await import("./queries/content");
  const m = await getMediaData(id);
  if (!m) return c.json({ error: "Not Found" }, 404);
  return c.body(Buffer.from(m.data, "base64"), 200, {
    "Content-Type": m.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

/* one-click unsubscribe — linked at the bottom of every newsletter email */
app.get("/api/newsletter/unsubscribe/:token", async (c) => {
  const { unsubscribeByToken } = await import("./queries/newsletter");
  const email = await unsubscribeByToken(c.req.param("token"));
  const page = (msg: string) => `<!doctype html><html><body style="margin:0;background:#120d08;color:#f0e6d2;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;max-width:420px;padding:24px;">
  <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a15a;">Vazhi letters</p>
  <h1 style="font-weight:normal;font-size:26px;">${msg}</h1>
  <a href="/" style="color:#c9a15a;font-size:13px;">← Back to Vazhi</a>
</div></body></html>`;
  return c.html(email ? page(`You've been unsubscribed. No more letters will be sent to ${email}.`) : page("This unsubscribe link is invalid or has already been used."));
});

/* weekly digest trigger — called by cron every Sunday; protected by a shared secret */
app.all("/api/newsletter/run-weekly", async (c) => {
  const secret = process.env.NEWSLETTER_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return c.json({ error: "NEWSLETTER_CRON_SECRET (or CRON_SECRET) not configured" }, 503);
  const auth = c.req.header("authorization") ?? "";
  const given =
    c.req.header("x-cron-secret") ??
    (auth.startsWith("Bearer ") ? auth.slice(7) : c.req.query("secret") ?? "");
  const { hashSecret } = await import("./queries/newsletter");
  if (hashSecret(given) !== hashSecret(secret)) return c.json({ error: "Forbidden" }, 403);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return c.json({ error: "RESEND_API_KEY not configured" }, 503);
  const base = process.env.SITE_BASE_URL || "https://vazhi.net";
  const from = process.env.NEWSLETTER_FROM || "Vazhi Letters <letters@vazhi.net>";
  const { buildDigest, sendDigest } = await import("./queries/newsletter");
  const plan = await buildDigest(base);
  if (!plan) return c.json({ ok: true, note: "no active subscribers" });
  const result = await sendDigest({ apiKey, from, siteBase: base, plan });
  return c.json({ ok: true, fallback: plan.isFallback, ...result });
});

/* analytics beacon — privacy-friendly: path + coarse country + dwell time */
app.post("/api/beacon", async (c) => {
  try {
    const raw = await c.req.text();
    const v = JSON.parse(raw || "{}");
    if (typeof v.p !== "string" || v.p.length > 250) return c.json({ ok: false }, 400);
    const { recordView } = await import("./queries/analytics");
    await recordView({
      path: v.p,
      country: typeof v.c === "string" ? v.c : "",
      duration: Number(v.d) || 0,
    });
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: false }, 400);
  }
});


/* ---------------------- OG cards, RSS, sitemap, robots ---------------------- */

const SITE_BASE = () => (process.env.SITE_BASE_URL || "https://vazhi.net").replace(/\/$/, "");

app.get("/og/:kind/:file", async (c) => {
  const kind = c.req.param("kind");
  const slug = c.req.param("file")?.replace(/\.png$/, "");
  if ((kind !== "story" && kind !== "place") || !slug) return c.json({ error: "Not Found" }, 404);
  const { ogCardFor } = await import("./queries/og");
  const png = await ogCardFor(kind, slug).catch((e) => { console.error("[og] render failed:", e); return null; });
  if (!png) return c.json({ error: "Not Found" }, 404);
  return c.body(new Uint8Array(png), 200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=86400",
  });
});

app.get("/og/default.png", async (c) => {
  const { defaultOgCard } = await import("./queries/og");
  const png = await defaultOgCard();
  return c.body(new Uint8Array(png), 200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=86400",
  });
});

const escXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

app.get("/rss.xml", async (c) => {
  const { latestContent } = await import("./queries/og");
  const base = SITE_BASE();
  const items = await latestContent(20);
  const entries = items
    .map((i) => {
      const url = `${base}${i.kind === "story" ? "/stories/" : "/place/"}${i.slug}`;
      return `    <item>
      <title>${escXml(i.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escXml(i.summary)}</description>
      ${i.publishedAt ? `<pubDate>${i.publishedAt.toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vazhi — Travel Wiki &amp; Atlas</title>
    <link>${base}</link>
    <description>Places, histories, cultures and journeys.</description>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
${entries}
  </channel>
</rss>`;
  return c.body(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=1800" });
});

app.get("/sitemap.xml", async (c) => {
  const { latestContent, listDestinations, listStates } = await import("./queries/og").then(async (m) => ({
    latestContent: m.latestContent,
    ...(await import("./queries/content")),
  }));
  const base = SITE_BASE();
  const [items, dests, states] = await Promise.all([latestContent(500), listDestinations(), listStates()]);
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/` },
    { loc: `${base}/stories` },
    { loc: `${base}/destinations` },
    { loc: `${base}/about` },
  ];
  for (const d of dests) urls.push({ loc: `${base}/destinations/${d.id}` });
  for (const st of states) {
    urls.push({ loc: `${base}/destinations/${st.destSlug}/states/${st.slug}` });
    for (const dist of st.districts) urls.push({ loc: `${base}/destinations/${st.destSlug}/states/${st.slug}/${dist.id}` });
  }
  for (const i of items) {
    urls.push({
      loc: `${base}${i.kind === "story" ? "/stories/" : "/place/"}${i.slug}`,
      lastmod: i.publishedAt ? i.publishedAt.toISOString().slice(0, 10) : undefined,
    });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return c.body(xml, 200, { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" });
});

app.get("/robots.txt", (c) => {
  const base = SITE_BASE();
  return c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${base}/sitemap.xml
`);
});

/* per-page social/SEO meta for stories & places — injected server-side so
   WhatsApp/X/Google see real titles and branded cards on shared links */
async function pageWithMeta(c: any, meta: { title: string; description: string; image: string; url: string }) {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const candidates = [
    path.resolve(import.meta.dirname, "../dist/public/index.html"), // source: api/
    path.resolve(import.meta.dirname, "public/index.html"),          // bundled: dist/boot.js
    path.resolve(process.cwd(), "dist/public/index.html"),           // Vercel: /var/task
  ];
  const indexPath = candidates.find((p) => fs.existsSync(p));
  if (!indexPath) throw new Error("index.html not found");
  let html = fs.readFileSync(indexPath, "utf-8");
  const tags = [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escXml(meta.title)}" />`,
    `<meta property="og:description" content="${escXml(meta.description)}" />`,
    `<meta property="og:image" content="${escXml(meta.image)}" />`,
    `<meta property="og:url" content="${escXml(meta.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escXml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escXml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escXml(meta.image)}" />`,
  ].join("\n    ");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escXml(meta.title)}</title>`);
  html = html.replace("</head>", `    ${tags}\n  </head>`);
  return c.html(html);
}

app.get("/stories/:slug", async (c, next) => {
  try {
    const { getStory } = await import("./queries/content");
    const s = await getStory(c.req.param("slug"));
    if (!s) return next();
    const base = SITE_BASE();
    return pageWithMeta(c, {
      title: s.seoTitle || `${s.title} — Vazhi`,
      description: s.seoDescription || s.lede.slice(0, 200),
      image: `${base}/og/story/${s.id}.png`,
      url: `${base}/stories/${s.id}`,
    });
  } catch {
    return next();
  }
});

app.get("/place/:slug", async (c, next) => {
  try {
    const { getPlace } = await import("./queries/content");
    const p = await getPlace(c.req.param("slug"));
    if (!p) return next();
    const base = SITE_BASE();
    return pageWithMeta(c, {
      title: `${p.name} — Vazhi Atlas`,
      description: p.summary.slice(0, 200),
      image: `${base}/og/place/${p.id}.png`,
      url: `${base}/place/${p.id}`,
    });
  } catch {
    return next();
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  /* weekly newsletter — fires every Sunday at 09:00 IST (03:30 UTC) */
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const nextSundayIST = () => {
    const now = Date.now();
    const d = new Date(now);
    d.setUTCHours(3, 30, 0, 0);
    while (d.getUTCDay() !== 0 || d.getTime() <= now) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  };
  let weeklyTimer: NodeJS.Timeout;
  const scheduleWeekly = () => {
    weeklyTimer = setTimeout(async () => {
      try {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          const base = process.env.SITE_BASE_URL || "https://vazhi.net";
          const from = process.env.NEWSLETTER_FROM || "Vazhi Letters <letters@vazhi.net>";
          const { buildDigest, sendDigest } = await import("./queries/newsletter");
          const plan = await buildDigest(base);
          if (plan) {
            const r = await sendDigest({ apiKey, from, siteBase: base, plan });
            console.log(`[newsletter] weekly send: ${r.sent} sent, ${r.failed} failed (fallback=${plan.isFallback})`);
          }
        }
      } catch (e) {
        console.error("[newsletter] weekly send failed:", e);
      }
      scheduleWeekly();
    }, nextSundayIST() - Date.now());
    weeklyTimer.unref();
  };
  scheduleWeekly();
}

import { getDb } from "./connection";
import { getStory, getPlace } from "./content";
import fs from "node:fs";
import path from "node:path";

/* ==================================================== OG share cards
   Server-rendered 1200×630 PNG per article/place — brand background,
   the item's cover photo on the right, the Vazhi logo + title on the
   left. Served at /og/:kind/:slug.png with long-cache headers. */

let sharpLib: any = null;
async function sharp() {
  if (!sharpLib) {
    const { createRequire } = await import("node:module");
    sharpLib = (createRequire(import.meta.url) as any)("sharp");
  }
  return sharpLib;
}

const CARD_W = 1200;
const CARD_H = 630;

/* bundled boot.js lives in dist/, source lives in api/queries/ — resolve both */
function distPublic(...p: string[]) {
  for (const base of [
    path.resolve(import.meta.dirname, "public"),           // bundled: dist/boot.js → dist/public
    path.resolve(import.meta.dirname, "../../dist/public"), // source: api/queries/
    path.resolve(process.cwd(), "dist/public"),             // Vercel: /var/task (includeFiles)
  ]) {
    const candidate = path.join(base, ...p);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(process.cwd(), "dist/public", ...p);
}

const escXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrapTitle(title: string, maxChars = 26): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
    if (lines.length === 3) break;
  }
  if (cur && lines.length < 4) lines.push(cur);
  return lines.slice(0, 4);
}

async function loadImageBuffer(ref: string): Promise<Buffer | null> {
  try {
    if (ref.startsWith("/api/media/")) {
      const id = Number(ref.split("/").pop());
      if (!Number.isInteger(id)) return null;
      const { getMediaData } = await import("./content");
      const m = await getMediaData(id);
      return m ? Buffer.from(m.data, "base64") : null;
    }
    if (/^https?:\/\//i.test(ref)) {
      const res = await fetch(ref, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    // bundled asset
    const p = distPublic("img/final", ref.replace(/^\/img\/final\//, ""));
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  } catch {
    return null;
  }
}

export async function renderOgCard(opts: {
  kicker: string;
  title: string;
  sub: string;
  imgRef: string | null;
}): Promise<Buffer> {
  const s = await sharp();

  // base: warm dark brand background
  const base = s({
    create: { width: CARD_W, height: CARD_H, channels: 3, background: { r: 18, g: 13, b: 8 } },
  }).jpeg();

  const composites: any[] = [];

  // soft bronze glow top-left so the card never reads flat black
  composites.push({
    input: Buffer.from(
      `<svg width="${CARD_W}" height="${CARD_H}">
        <radialGradient id="glow" cx="0.2" cy="0.1" r="0.9">
          <stop offset="0" stop-color="#3a2a15" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#120d08" stop-opacity="0"/>
        </radialGradient>
        <rect width="${CARD_W}" height="${CARD_H}" fill="url(#glow)"/>
      </svg>`
    ),
    left: 0, top: 0,
  });

  // cover photo on the right half, dimmed slightly
  if (opts.imgRef) {
    const buf = await loadImageBuffer(opts.imgRef);
    if (buf) {
      const cover = await s(buf)
        .resize(600, CARD_H, { cover: "cover" })
        .modulate({ brightness: 0.82 })
        .jpeg({ quality: 82 })
        .toBuffer();
      composites.push({ input: cover, left: CARD_W - 600, top: 0 });
      // gradient scrim over the seam
      const scrim = Buffer.from(
        `<svg width="240" height="${CARD_H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#120d08" stop-opacity="1"/>
          <stop offset="1" stop-color="#120d08" stop-opacity="0"/>
        </linearGradient></defs><rect width="240" height="${CARD_H}" fill="url(#g)"/></svg>`
      );
      composites.push({ input: scrim, left: CARD_W - 600, top: 0 });
    }
  }

  // logo
  const logoPath = distPublic("img/final", "logo-black.png");
  if (fs.existsSync(logoPath)) {
    const logo = await s(fs.readFileSync(logoPath))
      .resize(150, null, { fit: "inside" })
      .negate({ alpha: false }) // black strokes → white for dark bg
      .png()
      .toBuffer();
    composites.push({ input: logo, left: 72, top: 64 });
  }

  // text block
  const lines = wrapTitle(opts.title);
  const lineHeight = 62;
  const titleStart = 240;
  const titleSpans = lines
    .map(
      (l, i) =>
        `<text x="72" y="${titleStart + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="54" fill="#f0e6d2">${escXml(l)}</text>`
    )
    .join("");
  const textSvg = Buffer.from(
    `<svg width="680" height="${CARD_H}">
      <text x="72" y="${titleStart - 40}" font-family="Georgia, serif" font-size="21" letter-spacing="4" fill="#c9a15a">${escXml(opts.kicker.toUpperCase())}</text>
      ${titleSpans}
      <text x="72" y="${titleStart + lines.length * lineHeight + 26}" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#a08b66">${escXml(opts.sub)}</text>
      <text x="72" y="${CARD_H - 56}" font-family="Georgia, serif" font-size="20" letter-spacing="3" fill="#c9a15a">VAZHI.NET</text>
    </svg>`
  );
  composites.push({ input: textSvg, left: 0, top: 0 });

  return s(await base.toBuffer()).composite(composites).png({ compressionLevel: 6 }).toBuffer();
}

export async function ogCardFor(kind: "story" | "place", slug: string): Promise<Buffer | null> {
  if (kind === "story") {
    const st = await getStory(slug);
    if (!st) return null;
    return renderOgCard({ kicker: "Story · Vazhi", title: st.title, sub: st.time, imgRef: st.img });
  }
  const p = await getPlace(slug);
  if (!p) return null;
  return renderOgCard({ kicker: `${p.country} · Vazhi Atlas`, title: p.name, sub: p.region, imgRef: p.img });
}

export async function defaultOgCard(): Promise<Buffer> {
  return renderOgCard({
    kicker: "A travel wiki · A personal atlas",
    title: "Vazhi",
    sub: "Places, histories, cultures and journeys",
    imgRef: "hero.jpg",
  });
}

/* ---------------------------------- feed + sitemap data ---------------------------------- */

export interface FeedItem {
  kind: "story" | "place";
  slug: string;
  title: string;
  summary: string;
  img: string;
  publishedAt: Date | null;
}

export async function latestContent(limit = 20): Promise<FeedItem[]> {
  const { listStoriesAdmin, listPlacesAdmin, storiesTable, placeArticles } = await import("./content").then(async (m) => ({
    ...m,
    storiesTable: (await import("@db/schema")).storiesTable,
    placeArticles: (await import("@db/schema")).placeArticles,
  }));
  const db = getDb();
  const [stories, places, storyDates, placeDates] = await Promise.all([
    listStoriesAdmin("published"),
    listPlacesAdmin(),
    db.select({ slug: storiesTable.slug, publishedAt: storiesTable.publishedAt }).from(storiesTable),
    db.select({ slug: placeArticles.slug, publishedAt: placeArticles.publishedAt, createdAt: placeArticles.createdAt }).from(placeArticles),
  ]);
  const storyDateMap = new Map(storyDates.map((r) => [r.slug, r.publishedAt]));
  const placeDateMap = new Map(placeDates.map((r) => [r.slug, r.publishedAt ?? r.createdAt]));
  const items: FeedItem[] = [
    ...stories.map((s) => ({
      kind: "story" as const,
      slug: s.id,
      title: s.title,
      summary: s.lede,
      img: s.img,
      publishedAt: storyDateMap.get(s.id) ?? null,
    })),
    ...places.map((p) => ({
      kind: "place" as const,
      slug: p.id,
      title: p.name,
      summary: p.summary,
      img: p.img,
      publishedAt: placeDateMap.get(p.id) ?? null,
    })),
  ];
  return items
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .slice(0, limit);
}

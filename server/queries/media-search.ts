import { insertMedia } from "./content";

/* ==================================================== free image sourcing
   Searches Wikimedia Commons (freely licensed media) for any location,
   downloads the chosen image server-side, downsizes + recompresses it to
   WebP, and stores it in the media library with attribution metadata. */

export interface FreeImageHit {
  title: string;
  thumb: string;
  url: string;
  width: number;
  height: number;
  artist: string;
  license: string;
}

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

export async function searchFreeImages(query: string): Promise<FreeImageHit[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6", // File:
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "18",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "400",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "Vazhi/1.0 (heritage travel wiki; content tooling)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Commons search failed (${res.status})`);
  const data: any = await res.json();
  const pages = Object.values(data?.query?.pages ?? {}) as any[];
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii || !ii.thumburl) return null;
      const meta = ii.extmetadata ?? {};
      return {
        title: String(p.title ?? "").replace(/^File:/, ""),
        thumb: String(ii.thumburl),
        url: String(ii.url),
        width: Number(ii.width ?? 0),
        height: Number(ii.height ?? 0),
        artist: stripHtml(String(meta.Artist?.value ?? "")),
        license: String(meta.LicenseShortName?.value ?? "See Wikimedia Commons"),
      } satisfies FreeImageHit;
    })
    .filter((x): x is FreeImageHit => !!x && x.width >= 600);
}

/** Download a Commons image, compress to WebP (max 1920px wide), store in the library. */
export async function importFreeImage(hit: { url: string; title: string; artist: string; license: string }) {
  const res = await fetch(hit.url, {
    headers: { "User-Agent": "Vazhi/1.0 (heritage travel wiki; content tooling)" },
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 25 * 1024 * 1024) throw new Error("Source image too large");

  // sharp ships as a native CJS module — require it via createRequire to keep TS happy
  const { createRequire } = await import("module");
  const sharp = (createRequire(import.meta.url) as any)("sharp");
  const webp = await sharp(buf)
    .rotate() // respect EXIF orientation
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = hit.title.replace(/\.(jpe?g|png|gif|tif{1,2})$/i, "").slice(0, 180) + ".webp";
  const id = await insertMedia({
    fileName,
    mime: "image/webp",
    data: webp.toString("base64"),
    alt: hit.title.replace(/\.[^.]+$/, ""),
    caption: "",
    credit: hit.artist ? `${hit.artist} — Wikimedia Commons` : "Wikimedia Commons",
    license: hit.license,
  });
  return id;
}

/* ---------------------------------- upload optimization ---------------------------------- */

/** Normalize any uploaded image for the web: EXIF rotation, cap at 1920px wide,
    gently upscale very small images (min 1200px wide) for hero/card use, and
    recompress to WebP q82 — typically 50-70% smaller with no visible loss. */
export async function optimizeUpload(input: {
  fileName: string;
  mime: string;
  data: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
}) {
  const { createRequire } = await import("module");
  const sharp = (createRequire(import.meta.url) as any)("sharp");
  const buf = Buffer.from(input.data, "base64");

  const meta = await sharp(buf).metadata();
  let pipe = sharp(buf).rotate();

  // animated GIFs keep their format (webp conversion would freeze frames)
  const isAnimatedGif = input.mime === "image/gif" && (meta.pages ?? 1) > 1;
  if (isAnimatedGif) {
    return input;
  }

  const w = meta.width ?? 0;
  if (w > 1920) pipe = pipe.resize({ width: 1920, withoutEnlargement: true });
  else if (w > 0 && w < 800) pipe = pipe.resize({ width: 1200 }); // gentle upscale for small uploads

  const webp = await pipe.webp({ quality: 82 }).toBuffer();
  return {
    ...input,
    fileName: input.fileName.replace(/\.(jpe?g|png|gif|avif|webp)$/i, "") + ".webp",
    mime: "image/webp",
    data: webp.toString("base64"),
  };
}

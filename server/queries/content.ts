import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
  placeArticles,
  storiesTable,
  seriesTable,
  destinationsTable,
  statesTable,
  markersTable,
  journeysTable,
  recentPlacesTable,
  settingsTable,
  fontsTable,
  mediaTable,
  storyVersionsTable,
  contributionsTable,
  type ContributorData,
  type PlaceArticleRow,
  type StoryRow,
  type DestinationRow,
  type JourneyRow,
  type DistrictData,
} from "@db/schema";

// mysql2 returns JSON columns as raw strings in some environments — always
// coerce to a real object before handing rows to the frontend.
function fromJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}

// ---------- read: shapes matching the frontend's current data model ----------

export interface PlaceArticleDTO {
  id: string;
  name: string;
  region: string;
  country: string;
  destId: string;
  type: "Heritage" | "City" | "Nature";
  img: string;
  summary: string;
  sections: PlaceArticleRow["sections"];
  facts: PlaceArticleRow["facts"];
  related: string[];
  ta: PlaceArticleRow["ta"] | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  contributors?: ContributorData[];
  status?: PlaceArticleRow["status"];
  publishedAt?: Date | null;
}

function toPlaceDTO(r: PlaceArticleRow): PlaceArticleDTO {
  return {
    id: r.slug,
    name: r.name,
    region: r.region,
    country: r.country,
    destId: r.destSlug,
    type: r.type,
    img: r.img,
    summary: r.summary,
    sections: fromJson(r.sections, []),
    facts: fromJson(r.facts, []),
    related: fromJson(r.related, []),
    ta: r.ta ? fromJson(r.ta, null) : null,
    address: r.address ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    contributors: fromJson(r.contributors, []),
    status: r.status,
    publishedAt: r.publishedAt ?? null,
  };
}

export async function listPlaces(publishedOnly = true): Promise<PlaceArticleDTO[]> {
  const q = getDb().select().from(placeArticles);
  const rows = publishedOnly
    ? await q.where(eq(placeArticles.status, "published"))
    : await q;
  return rows.map(toPlaceDTO);
}

export async function listPlacesAdmin(): Promise<PlaceArticleDTO[]> {
  const rows = await getDb()
    .select()
    .from(placeArticles)
    .where(ne(placeArticles.status, "trash"));
  return rows.map(toPlaceDTO);
}

export async function setPlaceStatus(slug: string, status: "published" | "draft" | "trash") {
  await getDb()
    .update(placeArticles)
    .set({
      status,
      ...(status === "published" ? { publishedAt: new Date() } : {}),
    })
    .where(eq(placeArticles.slug, slug));
}

export async function getPlace(slug: string, publishedOnly = true): Promise<PlaceArticleDTO | undefined> {
  const [row] = await getDb()
    .select()
    .from(placeArticles)
    .where(eq(placeArticles.slug, slug))
    .limit(1);
  if (!row) return undefined;
  if (publishedOnly && row.status !== "published") return undefined;
  return toPlaceDTO(row);
}

export interface StoryDTO {
  id: string;
  tag: string;
  title: string;
  time: string;
  img: string;
  placeId: string | null;
  lede: string;
  body: StoryRow["body"];
  seriesSlug?: string | null;
  ta: StoryRow["ta"] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  relatedPlaces?: string[];
  contributors?: ContributorData[];
  status?: StoryRow["status"];
  publishedAt?: Date | null;
}

function toStoryDTO(r: StoryRow): StoryDTO {
  return {
    id: r.slug,
    tag: r.tag,
    title: r.title,
    time: r.readTime,
    img: r.img,
    placeId: r.placeSlug ?? null,
    lede: r.lede,
    body: r.body,
    seriesSlug: r.seriesSlug ?? null,
    ta: r.ta ? fromJson(r.ta, null) : null,
    seoTitle: r.seoTitle ?? null,
    seoDescription: r.seoDescription ?? null,
    seoKeywords: r.seoKeywords ?? null,
    relatedPlaces: fromJson(r.relatedPlaces, []),
    contributors: fromJson(r.contributors, []),
    status: r.status,
    publishedAt: r.publishedAt ?? null,
  };
}

export async function listStories(publishedOnly = true): Promise<StoryDTO[]> {
  const q = getDb().select().from(storiesTable).orderBy(asc(storiesTable.sort));
  const rows = publishedOnly
    ? await q.where(eq(storiesTable.status, "published"))
    : await q;
  return rows.map(toStoryDTO);
}

export async function listStoriesAdmin(status?: "published" | "draft" | "trash"): Promise<StoryDTO[]> {
  const q = getDb().select().from(storiesTable).orderBy(asc(storiesTable.sort));
  const rows = status
    ? await q.where(eq(storiesTable.status, status))
    : await q.where(ne(storiesTable.status, "trash"));
  return rows.map(toStoryDTO);
}

export async function setStoryStatus(slug: string, status: "published" | "draft" | "trash") {
  await getDb()
    .update(storiesTable)
    .set({
      status,
      ...(status === "published" ? { publishedAt: new Date() } : {}),
    })
    .where(eq(storiesTable.slug, slug));
}

export async function getStory(slug: string, publishedOnly = true): Promise<StoryDTO | undefined> {
  const [row] = await getDb()
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.slug, slug))
    .limit(1);
  if (!row) return undefined;
  if (publishedOnly && row.status !== "published") return undefined;
  return toStoryDTO(row);
}

export interface DestinationDTO {
  id: string;
  name: string;
  places: string;
  img: string;
  blurb: string;
  mapImg: string | null;
  taName: string | null;
  taPlacesLabel: string | null;
  taBlurb: string | null;
}

function toDestDTO(r: DestinationRow): DestinationDTO {
  return {
    id: r.slug,
    name: r.name,
    places: r.placesLabel,
    img: r.img,
    blurb: r.blurb,
    mapImg: r.mapImg ?? null,
    taName: r.taName ?? null,
    taPlacesLabel: r.taPlacesLabel ?? null,
    taBlurb: r.taBlurb ?? null,
  };
}

export async function listDestinations(): Promise<DestinationDTO[]> {
  const rows = await getDb()
    .select()
    .from(destinationsTable)
    .orderBy(asc(destinationsTable.sort));
  return rows.map(toDestDTO);
}

export async function listStates(): Promise<
  { destSlug: string; slug: string; name: string; districts: DistrictData[] }[]
> {
  const rows = await getDb().select().from(statesTable).orderBy(asc(statesTable.sort));
  return rows.map((r) => ({
    destSlug: r.destSlug,
    slug: r.slug,
    name: r.name,
    districts: fromJson(r.districts, []),
  }));
}

export async function listMarkers(): Promise<
  { destSlug: string; placeSlug: string; x: number; y: number }[]
> {
  const rows = await getDb().select().from(markersTable);
  return rows.map((r) => ({
    destSlug: r.destSlug,
    placeSlug: r.placeSlug,
    x: Number(r.x),
    y: Number(r.y),
  }));
}

export async function listJourneys(): Promise<
  { id: number; title: string; meta: string; map: string; note: string }[]
> {
  const rows = await getDb()
    .select()
    .from(journeysTable)
    .orderBy(asc(journeysTable.sort));
  return rows.map((r: JourneyRow) => ({
    id: r.id,
    title: r.title,
    meta: r.meta,
    map: r.map,
    note: r.note,
  }));
}

export async function listRecentSlugs(): Promise<string[]> {
  const rows = await getDb()
    .select()
    .from(recentPlacesTable)
    .orderBy(asc(recentPlacesTable.sort));
  return rows.map((r) => r.placeSlug);
}

export async function getSetting(k: string): Promise<string | undefined> {
  const [row] = await getDb()
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.k, k))
    .limit(1);
  return row?.v;
}

// ---------- write: admin mutations ----------

export async function upsertPlace(p: PlaceArticleDTO) {
  const values = {
    slug: p.id,
    ...(p.status ? { status: p.status } : {}),
    name: p.name,
    region: p.region,
    country: p.country,
    destSlug: p.destId,
    type: p.type,
    img: p.img,
    summary: p.summary,
    sections: p.sections,
    facts: p.facts,
    related: p.related,
    ta: p.ta ?? null,
    address: p.address ?? null,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    contributors: p.contributors ?? [],
  };
  await getDb()
    .insert(placeArticles)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        name: values.name,
        region: values.region,
        country: values.country,
        destSlug: values.destSlug,
        type: values.type,
        img: values.img,
        summary: values.summary,
        sections: values.sections,
        facts: values.facts,
        related: values.related,
        ta: values.ta,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        contributors: values.contributors,
      },
    });
}

export async function deletePlace(slug: string) {
  await getDb().delete(placeArticles).where(eq(placeArticles.slug, slug));
}

export async function upsertStory(s: StoryDTO) {
  const values = {
    slug: s.id,
    ...(s.status ? { status: s.status } : {}),
    tag: s.tag,
    title: s.title,
    readTime: s.time,
    img: s.img,
    placeSlug: s.placeId ?? null,
    lede: s.lede,
    body: s.body,
    seriesSlug: s.seriesSlug ?? null,
    ta: s.ta ?? null,
    seoTitle: s.seoTitle ?? null,
    seoDescription: s.seoDescription ?? null,
    seoKeywords: s.seoKeywords ?? null,
    relatedPlaces: s.relatedPlaces ?? [],
    contributors: s.contributors ?? [],
  };
  await getDb()
    .insert(storiesTable)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        tag: values.tag,
        title: values.title,
        readTime: values.readTime,
        img: values.img,
        placeSlug: values.placeSlug,
        lede: values.lede,
        body: values.body,
        seriesSlug: values.seriesSlug,
        ta: values.ta,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        seoKeywords: values.seoKeywords,
        relatedPlaces: values.relatedPlaces,
        contributors: values.contributors,
      },
    });
}

export async function deleteStory(slug: string) {
  await getDb().delete(storiesTable).where(eq(storiesTable.slug, slug));
}

/* ------------------------------- series ------------------------------- */

export interface SeriesDTO {
  id: string;
  name: string;
  nameTa: string | null;
  description: string | null;
  descTa: string | null;
  img: string;
  sort: number;
  count: number; // published stories in the series
}

export async function listSeries(publishedOnly = true): Promise<SeriesDTO[]> {
  const rows = await getDb().select().from(seriesTable).orderBy(asc(seriesTable.sort));
  const storyRows = await getDb()
    .select({ seriesSlug: storiesTable.seriesSlug })
    .from(storiesTable)
    .where(publishedOnly ? eq(storiesTable.status, "published") : ne(storiesTable.status, "trash"));
  const counts = new Map<string, number>();
  for (const s of storyRows) {
    if (!s.seriesSlug) continue;
    counts.set(s.seriesSlug, (counts.get(s.seriesSlug) ?? 0) + 1);
  }
  return rows.map((r) => ({
    id: r.slug,
    name: r.name,
    nameTa: r.nameTa ?? null,
    description: r.description ?? null,
    descTa: r.descTa ?? null,
    img: r.img,
    sort: r.sort,
    count: counts.get(r.slug) ?? 0,
  }));
}

export async function upsertSeries(s: Omit<SeriesDTO, "count" | "sort"> & { sort?: number }) {
  const values = {
    slug: s.id,
    name: s.name,
    nameTa: s.nameTa ?? null,
    description: s.description ?? null,
    descTa: s.descTa ?? null,
    img: s.img,
  };
  await getDb()
    .insert(seriesTable)
    .values({ ...values, sort: s.sort ?? 99 })
    .onDuplicateKeyUpdate({ set: values });
}

export async function deleteSeries(slug: string) {
  await getDb().delete(seriesTable).where(eq(seriesTable.slug, slug));
  // detach stories so they don't point at a series that no longer exists
  await getDb()
    .update(storiesTable)
    .set({ seriesSlug: null })
    .where(eq(storiesTable.seriesSlug, slug));
}

export async function upsertJourney(j: {
  id?: number;
  title: string;
  meta: string;
  map: string;
  note: string;
  sort?: number;
}) {
  if (j.id) {
    await getDb()
      .update(journeysTable)
      .set({ title: j.title, meta: j.meta, map: j.map, note: j.note })
      .where(eq(journeysTable.id, j.id));
  } else {
    await getDb()
      .insert(journeysTable)
      .values({
        title: j.title,
        meta: j.meta,
        map: j.map,
        note: j.note,
        sort: j.sort ?? 99,
      });
  }
}

export async function deleteJourney(id: number) {
  await getDb().delete(journeysTable).where(eq(journeysTable.id, id));
}

export async function upsertDestination(d: DestinationDTO) {
  const values = {
    slug: d.id,
    name: d.name,
    placesLabel: d.places,
    img: d.img,
    blurb: d.blurb,
    mapImg: d.mapImg ?? null,
    taName: d.taName ?? null,
    taPlacesLabel: d.taPlacesLabel ?? null,
    taBlurb: d.taBlurb ?? null,
  };
  await getDb()
    .insert(destinationsTable)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        name: values.name,
        placesLabel: values.placesLabel,
        img: values.img,
        blurb: values.blurb,
        mapImg: values.mapImg,
        taName: values.taName,
        taPlacesLabel: values.taPlacesLabel,
        taBlurb: values.taBlurb,
      },
    });
}

export async function setSetting(k: string, v: string) {
  await getDb()
    .insert(settingsTable)
    .values({ k, v })
    .onDuplicateKeyUpdate({ set: { v } });
}

// ---------- custom fonts (uploaded from the studio) ----------

export interface FontDTO {
  id: number;
  name: string;
  family: string;
  fileName: string;
  mime: string;
}

export async function listFonts(): Promise<FontDTO[]> {
  const rows = await getDb()
    .select({
      id: fontsTable.id,
      name: fontsTable.name,
      family: fontsTable.family,
      fileName: fontsTable.fileName,
      mime: fontsTable.mime,
    })
    .from(fontsTable)
    .orderBy(asc(fontsTable.id));
  return rows;
}

export async function insertFont(f: Omit<FontDTO, "id"> & { data: string }) {
  await getDb().insert(fontsTable).values(f);
}

export async function deleteFont(id: number) {
  await getDb().delete(fontsTable).where(eq(fontsTable.id, id));
}

export async function getFontData(id: number) {
  const rows = await getDb()
    .select({ mime: fontsTable.mime, data: fontsTable.data })
    .from(fontsTable)
    .where(eq(fontsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---------- media library (uploaded images with rights metadata) ----------

export interface MediaDTO {
  id: number;
  fileName: string;
  mime: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
}

const mediaMeta = {
  id: mediaTable.id,
  fileName: mediaTable.fileName,
  mime: mediaTable.mime,
  alt: mediaTable.alt,
  caption: mediaTable.caption,
  credit: mediaTable.credit,
  license: mediaTable.license,
};

export async function listMedia(): Promise<MediaDTO[]> {
  return getDb().select(mediaMeta).from(mediaTable).orderBy(desc(mediaTable.id));
}

export async function insertMedia(m: Omit<MediaDTO, "id"> & { data: string }): Promise<number> {
  const res: any = await getDb().insert(mediaTable).values(m);
  return Number(res[0]?.insertId ?? 0);
}

export async function updateMediaMeta(id: number, m: { alt: string; caption: string; credit: string; license: string }) {
  await getDb().update(mediaTable).set(m).where(eq(mediaTable.id, id));
}

export async function deleteMedia(id: number) {
  await getDb().delete(mediaTable).where(eq(mediaTable.id, id));
}

export async function getMediaData(id: number) {
  const rows = await getDb()
    .select({ mime: mediaTable.mime, data: mediaTable.data })
    .from(mediaTable)
    .where(eq(mediaTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ---------- story version history (restore points for the studio) ----------

let versionsTableReady = false;
async function ensureVersionsTable() {
  if (versionsTableReady) return;
  await getDb().execute(sql`
    CREATE TABLE IF NOT EXISTS story_versions (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      storySlug VARCHAR(160) NOT NULL,
      kind VARCHAR(20) NOT NULL DEFAULT 'edit',
      title VARCHAR(255) NOT NULL,
      lede TEXT NOT NULL,
      body LONGTEXT NOT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_story_versions_slug (storySlug)
    )
  `);
  versionsTableReady = true;
}

export interface StoryVersionDTO {
  id: number;
  storySlug: string;
  kind: string;
  title: string;
  lede: string;
  createdAt: string;
  size: number;
}

/** Snapshot the given story state. Called BEFORE a save overwrites it. */
export async function snapshotStoryVersion(storySlug: string, kind: "edit" | "publish", s: { title: string; lede: string; body: string }) {
  await ensureVersionsTable();
  await getDb().insert(storyVersionsTable).values({ storySlug, kind, title: s.title, lede: s.lede, body: s.body });
}

export async function latestStoryVersion(storySlug: string): Promise<{ id: number; body: string; createdAt: Date } | null> {
  await ensureVersionsTable();
  const rows = await getDb()
    .select({ id: storyVersionsTable.id, body: storyVersionsTable.body, createdAt: storyVersionsTable.createdAt })
    .from(storyVersionsTable)
    .where(eq(storyVersionsTable.storySlug, storySlug))
    .orderBy(desc(storyVersionsTable.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listStoryVersions(storySlug: string): Promise<StoryVersionDTO[]> {
  await ensureVersionsTable();
  const rows: any = await getDb().execute(sql`
    SELECT id, storySlug, kind, title, lede, createdAt, CHAR_LENGTH(body) AS size
    FROM story_versions WHERE storySlug = ${storySlug}
    ORDER BY id DESC LIMIT 40
  `);
  const list = rows[0] ?? rows;
  return (list as any[]).map((r) => ({
    id: Number(r.id),
    storySlug: r.storySlug,
    kind: r.kind,
    title: r.title,
    lede: r.lede,
    createdAt: new Date(r.createdAt).toISOString(),
    size: Number(r.size),
  }));
}

export async function getStoryVersion(id: number) {
  await ensureVersionsTable();
  const rows = await getDb().select().from(storyVersionsTable).where(eq(storyVersionsTable.id, id)).limit(1);
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, storySlug: r.storySlug, kind: r.kind, title: r.title, lede: r.lede, body: r.body, createdAt: r.createdAt.toISOString() };
}

// ---- Contributions inbox (knowledge / donation offers from readers) ----

export interface ContributionDTO {
  id: number;
  name: string;
  contact: string;
  kind: string;
  message: string;
  link: string | null;
  createdAt: string;
}

export async function insertContribution(c: {
  name: string;
  contact: string;
  kind: string;
  message: string;
  link?: string | null;
}) {
  await getDb().insert(contributionsTable).values({
    name: c.name,
    contact: c.contact,
    kind: c.kind,
    message: c.message,
    link: c.link ?? null,
  });
}

export async function listContributions(): Promise<ContributionDTO[]> {
  const rows = await getDb()
    .select()
    .from(contributionsTable)
    .orderBy(desc(contributionsTable.id));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    contact: r.contact,
    kind: r.kind,
    message: r.message,
    link: r.link ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function deleteContribution(id: number) {
  await getDb().delete(contributionsTable).where(eq(contributionsTable.id, id));
}


// ---------- atlas hierarchy mutations (states / districts / map markers) ----------

export async function upsertState(st: { destSlug: string; slug: string; name: string; districts: DistrictData[]; sort: number }) {
  const db = getDb();
  const existing = await db
    .select()
    .from(statesTable)
    .where(and(eq(statesTable.destSlug, st.destSlug), eq(statesTable.slug, st.slug)))
    .limit(1);
  if (existing.length) {
    await db.update(statesTable).set({ name: st.name, districts: st.districts, sort: st.sort }).where(eq(statesTable.id, existing[0].id));
  } else {
    await db.insert(statesTable).values({ destSlug: st.destSlug, slug: st.slug, name: st.name, districts: st.districts, sort: st.sort });
  }
}

export async function deleteState(destSlug: string, slug: string) {
  await getDb().delete(statesTable).where(and(eq(statesTable.destSlug, destSlug), eq(statesTable.slug, slug)));
}

export async function upsertMarker(m: { destSlug: string; placeSlug: string; x: number; y: number }) {
  const db = getDb();
  const existing = await db
    .select()
    .from(markersTable)
    .where(and(eq(markersTable.destSlug, m.destSlug), eq(markersTable.placeSlug, m.placeSlug)))
    .limit(1);
  const xs = String(Math.max(0, Math.min(100, m.x)));
  const ys = String(Math.max(0, Math.min(100, m.y)));
  if (existing.length) {
    await db.update(markersTable).set({ x: xs, y: ys }).where(eq(markersTable.id, existing[0].id));
  } else {
    await db.insert(markersTable).values({ destSlug: m.destSlug, placeSlug: m.placeSlug, x: xs, y: ys });
  }
}

export async function deleteMarker(destSlug: string, placeSlug: string) {
  await getDb().delete(markersTable).where(and(eq(markersTable.destSlug, destSlug), eq(markersTable.placeSlug, placeSlug)));
}

/* ------------------------- page sections (visibility) ------------------------ */

import { sectionsTable } from "@db/schema";

export interface SectionDTO {
  id: string;
  page: string;
  label: string;
  blurb: string;
  visible: boolean;
  sort: number;
}

export const SECTION_DEFAULTS: SectionDTO[] = [
  { id: "home.hero", page: "home", label: "Hero", blurb: "Full-screen opening image with the site title", visible: true, sort: 1 },
  { id: "home.interests", page: "home", label: "Interests strip", blurb: "Horizontal category chips under the hero", visible: true, sort: 2 },
  { id: "home.atlas", page: "home", label: "Atlas map", blurb: "Interactive world map with place markers", visible: true, sort: 3 },
  { id: "home.destinations", page: "home", label: "Destinations", blurb: "Country cards with cover images", visible: true, sort: 4 },
  { id: "home.heritage", page: "home", label: "Heritage", blurb: "Heritage highlights section", visible: true, sort: 5 },
  { id: "home.journeys", page: "home", label: "Journeys", blurb: "Curated multi-place journeys", visible: true, sort: 6 },
  { id: "home.stories", page: "home", label: "Stories", blurb: "Featured essays and field notes", visible: true, sort: 7 },
  { id: "home.recent", page: "home", label: "Recently added", blurb: "Latest places added to the atlas", visible: true, sort: 8 },
  { id: "home.join", page: "home", label: "Join Vazhi band", blurb: "Contribute / donate call-to-action with photo", visible: true, sort: 9 },
];

async function ensureSections() {
  const db = getDb();
  const rows = await db.select().from(sectionsTable);
  if (rows.length === 0) {
    for (const s of SECTION_DEFAULTS) {
      await db.insert(sectionsTable).values({ id: s.id, page: s.page, label: s.label, blurb: s.blurb, visible: s.visible, sort: s.sort });
    }
    return SECTION_DEFAULTS;
  }
  // register any new defaults added in code later
  const have = new Set(rows.map((r) => r.id));
  for (const s of SECTION_DEFAULTS) {
    if (!have.has(s.id)) {
      await db.insert(sectionsTable).values({ id: s.id, page: s.page, label: s.label, blurb: s.blurb, visible: s.visible, sort: s.sort });
    }
  }
  const all = await db.select().from(sectionsTable);
  return all
    .map((r) => ({ id: r.id, page: r.page, label: r.label, blurb: r.blurb, visible: r.visible, sort: r.sort }))
    .sort((a, b) => a.sort - b.sort);
}

export async function listSections(): Promise<SectionDTO[]> {
  return ensureSections();
}

export async function updateSection(id: string, patch: { visible?: boolean; sort?: number }) {
  await getDb().update(sectionsTable).set(patch).where(eq(sectionsTable.id, id));
}

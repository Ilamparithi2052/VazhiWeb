import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  longtext,
  json,
  boolean,
  int,
  double,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /* local auth: scrypt hash ("salt:hash" hex) — null for Google-only accounts */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /* TOTP two-factor: base32 secret + activation flag */
  totpSecret: varchar("totpSecret", { length: 64 }),
  totpEnabled: boolean("totpEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------- Vazhi content tables ----------

/** Rich text is stored as an HTML string; legacy rows hold paragraph arrays. */
export type RichBody = string | string[];

export interface WikiSectionData {
  heading: string;
  body: RichBody;
}

export interface WikiFactData {
  label: string;
  value: string;
}

/** Tamil translation payload for a place (mirrors content-ta.ts PlaceTa). */
export interface PlaceTaData {
  name: string;
  region: string;
  country: string;
  summary: string;
  sections?: WikiSectionData[];
  facts?: WikiFactData[];
}

export interface StoryTaData {
  title: string;
  time: string;
  lede: string;
  body: RichBody;
  tag?: string;
}

/** A credited contributor on a story or place page. */
export interface ContributorData {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
  link?: string;
  /** photo framing: zoom (1–3) and focal point as % offsets (0–100, default 50/50) */
  photoZoom?: number;
  photoX?: number;
  photoY?: number;
}

/** Long-form place articles (the wiki). */
export const placeArticles = mysqlTable("place_articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  destSlug: varchar("destSlug", { length: 120 }).notNull(),
  type: mysqlEnum("type", ["Heritage", "City", "Nature"]).notNull(),
  img: varchar("img", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  sections: json("sections").$type<WikiSectionData[]>().notNull(),
  facts: json("facts").$type<WikiFactData[]>().notNull(),
  related: json("related").$type<string[]>().notNull(),
  address: varchar("address", { length: 500 }),
  lat: double("lat"),
  lng: double("lng"),
  contributors: json("contributors").$type<ContributorData[]>(),
  ta: json("ta").$type<PlaceTaData>(),
  status: mysqlEnum("status", ["published", "draft", "trash"])
    .default("published")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PlaceArticleRow = typeof placeArticles.$inferSelect;

/** Long-form story essays. */
export const storiesTable = mysqlTable("stories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  tag: varchar("tag", { length: 80 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  readTime: varchar("readTime", { length: 40 }).notNull(),
  img: varchar("img", { length: 255 }).notNull(),
  placeSlug: varchar("placeSlug", { length: 120 }),
  lede: text("lede").notNull(),
  body: text("body").$type<RichBody>().notNull(),
  seriesSlug: varchar("seriesSlug", { length: 120 }),
  ta: json("ta").$type<StoryTaData>(),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  seoKeywords: varchar("seoKeywords", { length: 500 }),
  relatedPlaces: json("relatedPlaces").$type<string[]>(),
  contributors: json("contributors").$type<ContributorData[]>(),
  status: mysqlEnum("status", ["published", "draft", "trash"])
    .default("published")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  sort: int("sort").notNull().default(0),
});

export type StoryRow = typeof storiesTable.$inferSelect;

/** Story series — a named collection grouping several stories under one card. */
export const seriesTable = mysqlTable("series", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameTa: varchar("nameTa", { length: 255 }),
  description: text("description"),
  descTa: text("descTa"),
  img: varchar("img", { length: 255 }).notNull().default(""),
  sort: int("sort").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeriesRow = typeof seriesTable.$inferSelect;

/** Destination cards (countries / regions). */
export const destinationsTable = mysqlTable("destinations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  placesLabel: varchar("placesLabel", { length: 80 }).notNull(),
  img: varchar("img", { length: 255 }).notNull(),
  blurb: varchar("blurb", { length: 500 }).notNull(),
  mapImg: varchar("mapImg", { length: 255 }),
  taName: varchar("taName", { length: 255 }),
  taPlacesLabel: varchar("taPlacesLabel", { length: 80 }),
  taBlurb: varchar("taBlurb", { length: 500 }),
  sort: int("sort").notNull().default(0),
});

export type DestinationRow = typeof destinationsTable.$inferSelect;

export interface DistrictData {
  id: string;
  name: string;
  placeIds: string[];
}

/** One row per state/province inside a destination; districts as JSON. */
export const statesTable = mysqlTable("states", {
  id: serial("id").primaryKey(),
  destSlug: varchar("destSlug", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  districts: json("districts").$type<DistrictData[]>().notNull(),
  sort: int("sort").notNull().default(0),
});

export type StateRow = typeof statesTable.$inferSelect;

export interface MarkerData {
  id: string;
  x: number;
  y: number;
}

/** One marker row per (destination, place) for destination maps. */
export const markersTable = mysqlTable("markers", {
  id: serial("id").primaryKey(),
  destSlug: varchar("destSlug", { length: 120 }).notNull(),
  placeSlug: varchar("placeSlug", { length: 120 }).notNull(),
  x: varchar("x", { length: 20 }).notNull(),
  y: varchar("y", { length: 20 }).notNull(),
});

/** Journey cards on the home page. */
export const journeysTable = mysqlTable("journeys", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  meta: varchar("meta", { length: 255 }).notNull(),
  map: varchar("map", { length: 255 }).notNull(),
  note: text("note").notNull(),
  sort: int("sort").notNull().default(0),
});

export type JourneyRow = typeof journeysTable.$inferSelect;

/** Curated "recently added" strip — references place slugs. */
export const recentPlacesTable = mysqlTable("recent_places", {
  id: serial("id").primaryKey(),
  placeSlug: varchar("placeSlug", { length: 120 }).notNull(),
  sort: int("sort").notNull().default(0),
});

/** Simple editable settings (hero image etc.). */
export const settingsTable = mysqlTable("settings", {
  k: varchar("k", { length: 80 }).primaryKey(),
  v: text("v").notNull(),
});

/** Custom fonts uploaded from the studio — stored as base64, served via /api/fonts/:id. */
export const fontsTable = mysqlTable("fonts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  family: varchar("family", { length: 120 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mime: varchar("mime", { length: 80 }).notNull(),
  data: longtext("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FontRow = typeof fontsTable.$inferSelect;

/** Uploaded images for the media library — base64 in DB, served via /api/media/:id. */
export const mediaTable = mysqlTable("media", {
  id: serial("id").primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mime: varchar("mime", { length: 80 }).notNull(),
  data: longtext("data").notNull(),
  alt: varchar("alt", { length: 255 }).notNull().default(""),
  caption: varchar("caption", { length: 500 }).notNull().default(""),
  credit: varchar("credit", { length: 255 }).notNull().default(""),
  license: varchar("license", { length: 255 }).notNull().default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaRow = typeof mediaTable.$inferSelect;

/** Immutable snapshots of a story's title/lede/body — restore points for the studio. */
export const storyVersionsTable = mysqlTable("story_versions", {
  id: serial("id").primaryKey(),
  storySlug: varchar("storySlug", { length: 160 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull().default("edit"),
  title: varchar("title", { length: 255 }).notNull(),
  lede: text("lede").notNull(),
  body: longtext("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryVersionRow = typeof storyVersionsTable.$inferSelect;

/** Reader contributions — knowledge, photos, corrections — plus membership interest. */
export const contributionsTable = mysqlTable("contributions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  kind: varchar("kind", { length: 40 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContributionRow = typeof contributionsTable.$inferSelect;

/** Tracks seed completion. */
export const metaTable = mysqlTable("meta", {
  k: varchar("k", { length: 80 }).primaryKey(),
  v: varchar("v", { length: 255 }).notNull(),
  done: boolean("done").default(true).notNull(),
});

/** Page section visibility + ordering — controlled from the Studio Sections panel. */
export const sectionsTable = mysqlTable("page_sections", {
  id: varchar("id", { length: 80 }).primaryKey(),
  page: varchar("page", { length: 40 }).notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  blurb: varchar("blurb", { length: 255 }).notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sort: int("sort").notNull().default(0),
});

export type SectionRow = typeof sectionsTable.$inferSelect;

/** Newsletter subscribers — one row per email, token powers one-click unsubscribe. */
export const subscribersTable = mysqlTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriberRow = typeof subscribersTable.$inferSelect;

/** Every newsletter item ever sent to a subscriber — guarantees nothing repeats. */
export const newsletterLogTable = mysqlTable("newsletter_log", {
  id: serial("id").primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  kind: varchar("kind", { length: 20 }).notNull(),
  refId: varchar("refId", { length: 160 }).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type NewsletterLogRow = typeof newsletterLogTable.$inferSelect;


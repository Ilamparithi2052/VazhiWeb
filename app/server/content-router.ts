import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import * as q from "./queries/content";

/* rich text is stored as an HTML string; legacy paragraph arrays are still accepted */
const richText = z.union([z.string(), z.array(z.string())]);

const sectionSchema = z.object({ heading: z.string(), body: richText });
const factSchema = z.object({ label: z.string(), value: z.string() });

const contributorSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
  link: z.string().optional(),
});

const placeTaSchema = z.object({
  name: z.string(),
  region: z.string(),
  country: z.string(),
  summary: z.string(),
  sections: z.array(sectionSchema).optional(),
  facts: z.array(factSchema).optional(),
});

const placeInput = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers, dashes"),
  name: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
  destId: z.string().min(1),
  type: z.enum(["Heritage", "City", "Nature"]),
  img: z.string().min(1),
  summary: z.string().min(1),
  sections: z.array(sectionSchema),
  facts: z.array(factSchema),
  related: z.array(z.string()),
  ta: placeTaSchema.nullish(),
  address: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  contributors: z.array(contributorSchema).optional(),
  status: z.enum(["published", "draft"]).optional(),
});

const storyTaSchema = z.object({
  title: z.string(),
  time: z.string(),
  lede: z.string(),
  body: richText,
});

const storyInput = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  tag: z.string().min(1),
  title: z.string().min(1),
  time: z.string().min(1),
  img: z.string().min(1),
  placeId: z.string().nullish(),
  lede: z.string().min(1),
  body: richText,
  seriesSlug: z.string().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
  seoKeywords: z.string().nullish(),
  relatedPlaces: z.array(z.string()).optional(),
  contributors: z.array(contributorSchema).optional(),
  ta: storyTaSchema.nullish(),
  status: z.enum(["published", "draft"]).optional(),
  reason: z.enum(["auto", "manual", "publish"]).optional(),
});

const contributionInput = z.object({
  name: z.string().min(1).max(160),
  contact: z.string().min(3).max(255),
  kind: z.enum(["knowledge", "donation", "both"]),
  message: z.string().min(1).max(4000),
  link: z.string().max(500).optional(),
});

const seriesInput = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameTa: z.string().nullish(),
  description: z.string().nullish(),
  descTa: z.string().nullish(),
  img: z.string(),
  sort: z.number().optional(),
});

const journeyInput = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  meta: z.string().min(1),
  map: z.string().min(1),
  note: z.string().min(1),
  sort: z.number().optional(),
});

const destinationInput = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  places: z.string().min(1),
  img: z.string().min(1),
  blurb: z.string().min(1),
  mapImg: z.string().nullish(),
  taName: z.string().nullish(),
  taPlacesLabel: z.string().nullish(),
  taBlurb: z.string().nullish(),
});

const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** The body column stores clean HTML text; legacy array payloads become paragraphs. */
const coerceHtml = (b: string | string[]) =>
  typeof b === "string" ? b : b.map((p) => `<p>${escHtml(p)}</p>`).join("");

const statusSchema = z.enum(["published", "draft", "trash"]);

export const contentRouter = createRouter({
  // ---- public reads ----
  places: publicQuery.query(() => q.listPlaces()),
  place: publicQuery.input(z.object({ id: z.string() })).query(({ input }) => q.getPlace(input.id)),
  stories: publicQuery.query(() => q.listStories()),
  story: publicQuery.input(z.object({ id: z.string() })).query(({ input }) => q.getStory(input.id)),
  destinations: publicQuery.query(() => q.listDestinations()),
  states: publicQuery.query(() => q.listStates()),
  markers: publicQuery.query(() => q.listMarkers()),
  journeys: publicQuery.query(() => q.listJourneys()),
  recentSlugs: publicQuery.query(() => q.listRecentSlugs()),
  heroImg: publicQuery.query(async () => (await q.getSetting("hero_img")) ?? "hero.jpg"),
  fontsList: publicQuery.query(() => q.listFonts()),
  mediaList: publicQuery.query(() => q.listMedia()),
  typography: publicQuery.query(async () => ({
    fontsUrl: (await q.getSetting("fonts_url")) ?? "",
    bodyFont: (await q.getSetting("body_font")) ?? "",
    displayFont: (await q.getSetting("display_font")) ?? "",
  })),

  // ---- contributions (public submit, admin review) ----
  submitContribution: publicQuery.input(contributionInput).mutation(async ({ input }) => {
    await q.insertContribution({ ...input, link: input.link || null });
    return { ok: true };
  }),
  contributions: adminQuery.query(() => q.listContributions()),
  deleteContribution: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await q.deleteContribution(input.id);
    return { ok: true };
  }),

  // ---- page sections (visibility + ordering) ----
  sections: publicQuery.query(() => q.listSections()),
  updateSection: adminQuery
    .input(z.object({ id: z.string().min(1), visible: z.boolean().optional(), sort: z.number().optional() }))
    .mutation(async ({ input }) => {
      await q.updateSection(input.id, { visible: input.visible, sort: input.sort });
      return { ok: true };
    }),

  // ---- admin writes ----
  upsertPlace: adminQuery.input(placeInput).mutation(async ({ input }) => {
    await q.upsertPlace({ ...input, ta: input.ta ?? null, status: input.status });
    return { ok: true };
  }),
  deletePlace: adminQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await q.deletePlace(input.id);
    return { ok: true };
  }),
  upsertStory: adminQuery.input(storyInput).mutation(async ({ input }) => {
    // version history: snapshot the PREVIOUS state before overwriting it.
    // manual saves and publishes always snapshot; autosaves only when the last
    // snapshot is over 15 minutes old and the body actually changed.
    const prev = await q.getStory(input.id, false);
    if (prev) {
      const reason = input.reason ?? "manual";
      const latest = await q.latestStoryVersion(input.id);
      const prevBody = coerceHtml(prev.body);
      const stale = !latest || Date.now() - new Date(latest.createdAt).getTime() > 15 * 60 * 1000;
      const changed = !latest || latest.body !== prevBody;
      // publishes always leave a milestone snapshot; manual saves snapshot when
      // something changed; autosaves only when changed and the last snapshot is stale
      if (reason === "publish" || (changed && (reason === "manual" || stale))) {
        await q.snapshotStoryVersion(input.id, reason === "publish" ? "publish" : "edit", {
          title: prev.title,
          lede: prev.lede,
          body: prevBody,
        });
      }
    }
    await q.upsertStory({
      ...input,
      body: coerceHtml(input.body),
      placeId: input.placeId ?? null,
      seriesSlug: input.seriesSlug || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      seoKeywords: input.seoKeywords || null,
      relatedPlaces: input.relatedPlaces ?? [],
      ta: input.ta ?? null,
      status: input.status,
    });
    return { ok: true };
  }),
  storyVersions: adminQuery.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return q.listStoryVersions(input.id);
  }),
  storyVersion: adminQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return q.getStoryVersion(input.id);
  }),
  deleteStory: adminQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await q.deleteStory(input.id);
    return { ok: true };
  }),
  series: publicQuery.query(() => q.listSeries()),
  upsertSeries: adminQuery.input(seriesInput).mutation(async ({ input }) => {
    await q.upsertSeries({
      ...input,
      nameTa: input.nameTa || null,
      description: input.description || null,
      descTa: input.descTa || null,
    });
    return { ok: true };
  }),
  deleteSeries: adminQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await q.deleteSeries(input.id);
    return { ok: true };
  }),
  upsertJourney: adminQuery.input(journeyInput).mutation(async ({ input }) => {
    await q.upsertJourney(input);
    return { ok: true };
  }),
  deleteJourney: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await q.deleteJourney(input.id);
    return { ok: true };
  }),
  upsertDestination: adminQuery.input(destinationInput).mutation(async ({ input }) => {
    await q.upsertDestination({
      ...input,
      mapImg: input.mapImg ?? null,
      taName: input.taName ?? null,
      taPlacesLabel: input.taPlacesLabel ?? null,
      taBlurb: input.taBlurb ?? null,
    });
    return { ok: true };
  }),
  setHeroImg: adminQuery.input(z.object({ img: z.string().min(1) })).mutation(async ({ input }) => {
    await q.setSetting("hero_img", input.img);
    return { ok: true };
  }),
  /* generic homepage/section content edited from Studio → Sections */
  siteContent: publicQuery.query(async () => {
    const keys = ["home_hero", "home_interests", "home_join"];
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const v = await q.getSetting(k);
      if (v) {
        try { out[k] = JSON.parse(v); } catch { /* ignore malformed */ }
      }
    }
    return out;
  }),
  setSiteContent: adminQuery
    .input(z.object({ key: z.enum(["home_hero", "home_interests", "home_join"]), value: z.string().max(200_000) }))
    .mutation(async ({ input }) => {
      await q.setSetting(input.key, input.value);
      return { ok: true };
    }),
  /* navigation / header chrome — toggles + top-menu order, edited from Studio → Settings */
  navConfig: publicQuery.query(async () => {
    const v = await q.getSetting("nav_config");
    if (!v) return null;
    try {
      const cfg = JSON.parse(v) as {
        showLogin: boolean; showLang: boolean; showTheme: boolean; showSearch: boolean;
        menu?: { id: string; label?: string; labelTa?: string; href?: string }[];
        menuOrder?: string[]; // legacy shape from the first version of this panel
      };
      // migrate legacy { menuOrder: ["explore",...] } into the unified menu list
      if (!cfg.menu && Array.isArray(cfg.menuOrder)) {
        cfg.menu = cfg.menuOrder.map((id) => ({ id }));
      }
      return cfg;
    }
    catch { return null; }
  }),
  setNavConfig: adminQuery
    .input(
      z.object({
        showLogin: z.boolean(),
        showLang: z.boolean(),
        showTheme: z.boolean(),
        showSearch: z.boolean(),
        menu: z
          .array(
            z.object({
              id: z.string().min(1).max(40),
              label: z.string().max(60).optional(),
              labelTa: z.string().max(120).optional(),
              href: z.string().max(300).optional(),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .mutation(async ({ input }) => {
      await q.setSetting("nav_config", JSON.stringify(input));
      return { ok: true };
    }),
  uploadFont: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(120),
        fileName: z.string().min(1).max(255),
        mime: z.string().regex(/^font\/(woff2?|ttf|otf)$|^application\/(font-woff|x-font-ttf)$/),
        data: z.string().min(8).max(8_000_000), // base64 payload, ~6MB raw ceiling
      })
    )
    .mutation(async ({ input }) => {
      const family = input.name.replace(/[^a-zA-Z0-9 -]/g, "").trim() || input.name;
      await q.insertFont({ ...input, family });
      return { ok: true };
    }),
  deleteFont: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await q.deleteFont(input.id);
    return { ok: true };
  }),
  uploadMedia: adminQuery
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        mime: z.string().regex(/^image\/(jpeg|png|webp|gif|avif)$/),
        data: z.string().min(8).max(14_000_000), // base64 payload, ~10MB raw ceiling
        alt: z.string().max(255).default(""),
        caption: z.string().max(500).default(""),
        credit: z.string().max(255).default(""),
        license: z.string().max(255).default(""),
      })
    )
    .mutation(async ({ input }) => {
      const { optimizeUpload } = await import("./queries/media-search");
      const optimized = await optimizeUpload(input);
      const id = await q.insertMedia(optimized);
      return { ok: true, id };
    }),
  updateMedia: adminQuery
    .input(
      z.object({
        id: z.number(),
        alt: z.string().max(255).default(""),
        caption: z.string().max(500).default(""),
        credit: z.string().max(255).default(""),
        license: z.string().max(255).default(""),
      })
    )
    .mutation(async ({ input }) => {
      await q.updateMediaMeta(input.id, {
        alt: input.alt,
        caption: input.caption,
        credit: input.credit,
        license: input.license,
      });
      return { ok: true };
    }),
  deleteMedia: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await q.deleteMedia(input.id);
    return { ok: true };
  }),

  upsertState: adminQuery
    .input(
      z.object({
        destSlug: z.string().min(1).max(120),
        slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
        name: z.string().min(1).max(255),
        districts: z.array(z.object({
          id: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
          name: z.string().min(1).max(255),
          placeIds: z.array(z.string().max(120)).max(500),
        })).max(300),
        sort: z.number().int().default(0),
      })
    )
    .mutation(async ({ input }) => {
      await q.upsertState(input);
      return { ok: true };
    }),
  deleteState: adminQuery
    .input(z.object({ destSlug: z.string(), slug: z.string() }))
    .mutation(async ({ input }) => {
      await q.deleteState(input.destSlug, input.slug);
      return { ok: true };
    }),
  upsertMarker: adminQuery
    .input(z.object({
      destSlug: z.string().min(1),
      placeSlug: z.string().min(1),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      await q.upsertMarker(input);
      return { ok: true };
    }),
  deleteMarker: adminQuery
    .input(z.object({ destSlug: z.string(), placeSlug: z.string() }))
    .mutation(async ({ input }) => {
      await q.deleteMarker(input.destSlug, input.placeSlug);
      return { ok: true };
    }),

  searchFreeImages: adminQuery
    .input(z.object({ query: z.string().min(2).max(120) }))
    .query(async ({ input }) => {
      const { searchFreeImages } = await import("./queries/media-search");
      return searchFreeImages(input.query);
    }),
  importFreeImage: adminQuery
    .input(z.object({
      url: z.string().url().max(1000),
      title: z.string().max(255),
      artist: z.string().max(255),
      license: z.string().max(255),
    }))
    .mutation(async ({ input }) => {
      const { importFreeImage } = await import("./queries/media-search");
      const id = await importFreeImage(input);
      return { ok: true, id };
    }),

  setTypography: adminQuery
    .input(z.object({ fontsUrl: z.string(), bodyFont: z.string(), displayFont: z.string() }))
    .mutation(async ({ input }) => {
      await q.setSetting("fonts_url", input.fontsUrl);
      await q.setSetting("body_font", input.bodyFont);
      await q.setSetting("display_font", input.displayFont);
      return { ok: true };
    }),

  // ---- publishing workflow ----
  adminPlaces: adminQuery.query(() => q.listPlacesAdmin()),
  adminStories: adminQuery
    .input(z.object({ status: statusSchema.optional() }).optional())
    .query(({ input }) => q.listStoriesAdmin(input?.status)),
  setPlaceStatus: adminQuery
    .input(z.object({ id: z.string(), status: statusSchema }))
    .mutation(async ({ input }) => {
      await q.setPlaceStatus(input.id, input.status);
      return { ok: true };
    }),
  setStoryStatus: adminQuery
    .input(z.object({ id: z.string(), status: statusSchema }))
    .mutation(async ({ input }) => {
      await q.setStoryStatus(input.id, input.status);
      return { ok: true };
    }),
});

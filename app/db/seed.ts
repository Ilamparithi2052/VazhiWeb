import { eq } from "drizzle-orm";
import { getDb } from "../server/queries/connection";
import {
  placeArticles,
  storiesTable,
  destinationsTable,
  statesTable,
  markersTable,
  journeysTable,
  recentPlacesTable,
  settingsTable,
  metaTable,
} from "./schema";
import {
  places,
  storyArticles,
  destinationHierarchy,
  destMarkers,
  destMapImages,
  destinations,
  journeys,
  recentlyAdded,
  placesTa,
  storiesTa,
  destTa,
} from "./content-data";

async function seed() {
  const db = getDb();
  console.log("Seeding Vazhi content...");

  const existing = await db
    .select()
    .from(metaTable)
    .where(eq(metaTable.k, "seeded"));
  if (existing.length > 0) {
    console.log("Already seeded — skipping.");
    process.exit(0);
  }

  // ---- Place articles ----
  const placeRows = Object.values(places).map((p) => ({
    slug: p.id,
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
    ta: placesTa[p.id] ?? null,
  }));
  await db.insert(placeArticles).values(placeRows);
  console.log(`  places: ${placeRows.length}`);

  // ---- Stories (long-form) ----
  const storyRows = Object.values(storyArticles).map((s, i) => ({
    slug: s.id,
    tag: s.tag,
    title: s.title,
    readTime: s.time,
    img: s.img,
    placeSlug: s.placeId ?? null,
    lede: s.lede,
    body: s.body,
    ta: storiesTa[s.id] ?? null,
    sort: i,
  }));
  await db.insert(storiesTable).values(storyRows);
  console.log(`  stories: ${storyRows.length}`);

  // ---- Destinations ----
  const destRows = destinations.map((d, i) => ({
    slug: d.id,
    name: d.name,
    placesLabel: d.places,
    img: d.img,
    blurb: d.blurb,
    mapImg: destMapImages[d.id] ?? null,
    taName: destTa[d.id]?.name ?? null,
    taPlacesLabel: destTa[d.id]?.places ?? null,
    taBlurb: destTa[d.id]?.blurb ?? null,
    sort: i,
  }));
  await db.insert(destinationsTable).values(destRows);
  console.log(`  destinations: ${destRows.length}`);

  // ---- States & districts ----
  const stateRows: (typeof statesTable.$inferInsert)[] = [];
  for (const [destSlug, states] of Object.entries(destinationHierarchy)) {
    states.forEach((st, i) => {
      stateRows.push({
        destSlug,
        slug: st.id,
        name: st.name,
        districts: st.districts,
        sort: i,
      });
    });
  }
  if (stateRows.length) await db.insert(statesTable).values(stateRows);
  console.log(`  states: ${stateRows.length}`);

  // ---- Map markers ----
  const markerRows: (typeof markersTable.$inferInsert)[] = [];
  for (const [destSlug, marks] of Object.entries(destMarkers)) {
    for (const m of marks) {
      markerRows.push({
        destSlug,
        placeSlug: m.id,
        x: String(m.x),
        y: String(m.y),
      });
    }
  }
  if (markerRows.length) await db.insert(markersTable).values(markerRows);
  console.log(`  markers: ${markerRows.length}`);

  // ---- Journeys ----
  const journeyRows = journeys.map((j, i) => ({ ...j, sort: i }));
  await db.insert(journeysTable).values(journeyRows);
  console.log(`  journeys: ${journeyRows.length}`);

  // ---- Recently added (references place slugs) ----
  const recentRows = recentlyAdded.map((p, i) => ({ placeSlug: p.id, sort: i }));
  await db.insert(recentPlacesTable).values(recentRows);
  console.log(`  recent: ${recentRows.length}`);

  // ---- Settings ----
  await db
    .insert(settingsTable)
    .values([{ k: "hero_img", v: "hero.jpg" }])
    .onDuplicateKeyUpdate({ set: { v: "hero.jpg" } });

  await db.insert(metaTable).values({ k: "seeded", v: new Date().toISOString() });
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

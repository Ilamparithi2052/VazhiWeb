import { sql } from "drizzle-orm";
import { getDb } from "./connection";

/* ============================================================ analytics
   Privacy-friendly, self-hosted: one row per page view. No IPs, no
   cookies, no fingerprinting — just path, coarse country (derived from
   the visitor's timezone), dwell time and timestamp. */

let analyticsReady = false;
async function ensureAnalyticsTable() {
  if (analyticsReady) return;
  await getDb().execute(sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      kind VARCHAR(20) NOT NULL DEFAULT 'page',
      refId VARCHAR(160) NOT NULL DEFAULT '',
      path VARCHAR(255) NOT NULL,
      country VARCHAR(8) NOT NULL DEFAULT '',
      duration INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_page_views_created (createdAt),
      INDEX idx_page_views_ref (kind, refId)
    )
  `);
  analyticsReady = true;
}

export function classifyPath(path: string): { kind: string; refId: string } {
  const m = path.match(/^\/(stories|place)\/([a-z0-9-]+)/i);
  if (m) return { kind: m[1] === "stories" ? "story" : "place", refId: m[2].toLowerCase() };
  if (path.startsWith("/destinations")) return { kind: "destination", refId: path.split("/")[2] ?? "" };
  return { kind: "page", refId: path === "/" ? "home" : path.replace(/^\//, "").split("/")[0] };
}

export async function recordView(v: { path: string; country: string; duration: number }) {
  if (v.path.startsWith("/admin") || v.path.startsWith("/api")) return;
  await ensureAnalyticsTable();
  const { kind, refId } = classifyPath(v.path);
  await getDb().execute(sql`
    INSERT INTO page_views (kind, refId, path, country, duration)
    VALUES (${kind}, ${refId}, ${v.path.slice(0, 250)}, ${v.country.slice(0, 8)}, ${Math.max(0, Math.min(v.duration, 7200))})
  `);
}

export interface AnalyticsOverview {
  totalViews: number;
  viewsToday: number;
  views7d: number;
  avgDwell: number;
  daily: { day: string; views: number }[];
  topContent: { kind: string; refId: string; views: number; avgDwell: number; totalDwell: number }[];
  countries: { country: string; views: number }[];
}

export async function analyticsOverview(): Promise<AnalyticsOverview> {
  await ensureAnalyticsTable();
  const db = getDb();

  const totals: any = await db.execute(sql`
    SELECT COUNT(*) AS total,
      SUM(createdAt >= CURDATE()) AS today,
      SUM(createdAt >= NOW() - INTERVAL 7 DAY) AS wk,
      COALESCE(AVG(NULLIF(duration, 0)), 0) AS avgDwell
    FROM page_views
  `);
  const t = (totals[0] as any[])[0] ?? {};

  const dailyRows: any = await db.execute(sql`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day, COUNT(*) AS views
    FROM page_views
    WHERE createdAt >= CURDATE() - INTERVAL 13 DAY
    GROUP BY day ORDER BY day
  `);
  const dailyMap = new Map<string, number>();
  for (const r of dailyRows[0] as any[]) dailyMap.set(String(r.day), Number(r.views));
  const daily: { day: string; views: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    daily.push({ day: key, views: dailyMap.get(key) ?? 0 });
  }

  const topRows: any = await db.execute(sql`
    SELECT kind, refId, COUNT(*) AS views,
      COALESCE(AVG(NULLIF(duration, 0)), 0) AS avgDwell,
      COALESCE(SUM(duration), 0) AS totalDwell
    FROM page_views
    WHERE kind IN ('story', 'place')
    GROUP BY kind, refId
    ORDER BY views DESC
    LIMIT 40
  `);
  const topContent = (topRows[0] as any[]).map((r) => ({
    kind: String(r.kind),
    refId: String(r.refId),
    views: Number(r.views),
    avgDwell: Math.round(Number(r.avgDwell)),
    totalDwell: Number(r.totalDwell),
  }));

  const countryRows: any = await db.execute(sql`
    SELECT country, COUNT(*) AS views
    FROM page_views
    WHERE country <> ''
    GROUP BY country
    ORDER BY views DESC
    LIMIT 30
  `);
  const countries = (countryRows[0] as any[]).map((r) => ({ country: String(r.country), views: Number(r.views) }));

  return {
    totalViews: Number(t.total ?? 0),
    viewsToday: Number(t.today ?? 0),
    views7d: Number(t.wk ?? 0),
    avgDwell: Math.round(Number(t.avgDwell ?? 0)),
    daily,
    topContent,
    countries,
  };
}

/** Per-article stats for one story/place (used on the Insights detail). */
export async function contentStats(kind: string, refId: string) {
  await ensureAnalyticsTable();
  const db = getDb();
  const rows: any = await db.execute(sql`
    SELECT COUNT(*) AS views, COALESCE(AVG(NULLIF(duration, 0)), 0) AS avgDwell,
      COALESCE(SUM(duration), 0) AS totalDwell
    FROM page_views WHERE kind = ${kind} AND refId = ${refId}
  `);
  const r = (rows[0] as any[])[0] ?? {};
  return { views: Number(r.views ?? 0), avgDwell: Math.round(Number(r.avgDwell ?? 0)), totalDwell: Number(r.totalDwell ?? 0) };
}

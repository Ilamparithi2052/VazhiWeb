/**
 * Vercel serverless entrypoint.
 *
 * The production bundle `dist/boot.js` (built by `npm run build` via esbuild)
 * is fully self-contained — every alias and dependency is inlined — so this
 * handler just lazy-loads it once per warm instance and forwards requests.
 *
 * `import "sharp"` lets Vercel's file tracer detect and bundle sharp's
 * native binaries (OG card rendering + upload compression call it through
 * createRequire, which static analysis can't see).
 */
import "sharp";

type App = { fetch: (req: Request) => Promise<Response> | Response };

let appPromise: Promise<App> | null = null;

function getApp(): Promise<App> {
  appPromise ??= import("../dist/boot.js").then((m) => m.default as App);
  return appPromise;
}

export const config = {
  /* OG rendering + media work can exceed the default 10s on cold start */
  maxDuration: 60,
};

export default async function handler(req: Request): Promise<Response> {
  const app = await getApp();
  return app.fetch(req);
}

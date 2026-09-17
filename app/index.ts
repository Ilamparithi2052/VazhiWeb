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
 *
 * NOTE: exported as a Node-style (req, res) handler, NOT a Web fetch handler —
 * @vercel/node's default-export contract ignores a returned Response, which
 * would leave every request hanging until timeout. We bridge the two styles
 * by piping the Web Response into the Node res manually.
 */
import "sharp";
import type { IncomingMessage, ServerResponse } from "node:http";

type App = { fetch: (req: Request) => Promise<Response> | Response };

let appPromise: Promise<App> | null = null;

function getApp(): Promise<App> {
  appPromise ??= import("../dist/boot.js").then((m) => m.default as App);
  return appPromise;
}

export const config = {
  /* OG rendering + media work can exceed the default 10s on cold start */
  maxDuration: 60,
  /* keep the function close to the TiDB cluster (us-east-1) */
  regions: ["iad1"],
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getApp();

  const host = req.headers.host ?? "localhost";
  const url = `https://${host}${req.url ?? "/"}`;

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(", "));
  }

  const method = (req.method ?? "GET").toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuf = hasBody
    ? await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      })
    : undefined;
  /* Buffer's generic typing clashes with BodyInit — a plain Uint8Array is accepted */
  const body = bodyBuf ? new Uint8Array(bodyBuf) : undefined;

  const webReq = new Request(url, { method, headers, body });
  const webRes = await app.fetch(webReq);

  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      /* multiple Set-Cookie headers must not be merged */
      const all = webRes.headers.getSetCookie?.() ?? [value];
      res.setHeader("set-cookie", all);
      return;
    }
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await webRes.arrayBuffer()));
}

/* Ambient declaration so Vercel's @vercel/node type-checker understands the
   esbuild bundle without tracing its bundler-style imports (aliases like
   @db/* and extensionless paths resolve at bundle time, not in tsc). */
declare module "*/dist/boot.js" {
  const app: { fetch: (req: Request) => Promise<Response> | Response };
  export default app;
}

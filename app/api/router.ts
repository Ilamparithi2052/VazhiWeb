import { authRouter } from "./auth-router";
import { contentRouter } from "./content-router";
import { newsletterRouter } from "./newsletter-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  content: contentRouter,
  newsletter: newsletterRouter,
});

export type AppRouter = typeof appRouter;

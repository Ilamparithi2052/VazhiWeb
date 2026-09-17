import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import * as n from "./queries/newsletter";

export const newsletterRouter = createRouter({
  subscribe: publicQuery
    .input(z.object({ email: z.string().min(3).max(255), name: z.string().max(160).optional() }))
    .mutation(({ input }) => n.subscribe(input.email, input.name)),

  subscribers: adminQuery.query(() => n.listSubscribers()),

  import: adminQuery
    .input(z.object({ text: z.string().min(1).max(200_000) }))
    .mutation(({ input }) => n.importSubscribers(input.text)),

  remove: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => n.removeSubscriber(input.id)),

  /** Preview this week's digest as it would go out right now. */
  preview: adminQuery.query(async () => {
    const base = process.env.SITE_BASE_URL || "https://vazhi.net";
    const plan = await n.buildDigest(base);
    if (!plan) return { empty: true as const };
    if (plan.isFallback) {
      const first = Object.values(plan.personal)[0];
      return {
        empty: false as const,
        isFallback: true,
        html: first ? n.renderEmail(first, "#unsubscribe", { isFallback: true }) : "",
        subject: first ? `From the archive: ${first.title}` : "",
      };
    }
    return {
      empty: false as const,
      isFallback: false,
      html: n.renderDigestEmail(plan.items, "#unsubscribe"),
      subject:
        plan.items.length === 1 ? `New this week: ${plan.items[0].title}` : `Vazhi: ${plan.items.length} new additions this week`,
    };
  }),

  /** Manual send — same code path as the weekly cron. */
  sendNow: adminQuery.mutation(async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured on the server");
    const base = process.env.SITE_BASE_URL || "https://vazhi.net";
    const from = process.env.NEWSLETTER_FROM || "Vazhi Letters <letters@vazhi.net>";
    const plan = await n.buildDigest(base);
    if (!plan) return { sent: 0, failed: 0, error: "no active subscribers" };
    return n.sendDigest({ apiKey, from, siteBase: base, plan });
  }),
});

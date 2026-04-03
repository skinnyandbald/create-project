import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init";

const healthOutput = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

const meOutput = z.object({
  id: z.string(),
  email: z.string().nullable(),
});

export const appRouter = createTRPCRouter({
  health: publicProcedure.output(healthOutput).query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  me: protectedProcedure.output(meOutput).query(({ ctx }) => {
    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
    };
  }),
});

export type AppRouter = typeof appRouter;

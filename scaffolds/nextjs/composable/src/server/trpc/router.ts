import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
    };
  }),
});

export type AppRouter = typeof appRouter;

import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from './init'

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return { id: ctx.user.id, email: ctx.user.email }
  }),
})

export type AppRouter = typeof appRouter

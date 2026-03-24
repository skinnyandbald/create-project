import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return { db, session };
});

const t = initTRPC
	.context<Awaited<ReturnType<typeof createTRPCContext>>>()
	.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({ ctx: { ...ctx, session: ctx.session } });
});

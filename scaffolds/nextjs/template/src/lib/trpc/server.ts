import { createCallerFactory, createTRPCContext } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/router";

const createCaller = createCallerFactory(appRouter);

export async function api() {
  const context = await createTRPCContext();
  return createCaller(context);
}

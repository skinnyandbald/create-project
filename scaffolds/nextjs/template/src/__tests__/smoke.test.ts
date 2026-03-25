import { describe, expect, it } from "vitest";

describe("scaffold health", () => {
  it("zod v4 works", async () => {
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });
    expect(schema.parse({ name: "test" })).toEqual({ name: "test" });
  });

  it("tRPC router initializes", async () => {
    const { appRouter } = await import("@/server/trpc/router");
    expect(appRouter).toBeDefined();
    expect(typeof appRouter.createCaller).toBe("function");
  });
});

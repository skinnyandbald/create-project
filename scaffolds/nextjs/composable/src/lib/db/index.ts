import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const sql: NeonQueryFunction<false, false> = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

/** @deprecated Use `getDb()` for lazy initialization. This getter exists for convenience. */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

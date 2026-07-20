import { blackBoxDatabaseEnabled, env } from "@agentkogei/env/server";
import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";

import * as schema from "./schema";

const testDatabaseKey = Symbol.for("agentkogei.black-box-postgres");

function createNeonDb() {
	const sql = neon(env.DATABASE_URL);
	return drizzle(sql, { schema });
}

type Database = ReturnType<typeof createNeonDb>;

function createBlackBoxDb(): Database {
	const globals = globalThis as typeof globalThis & {
		[testDatabaseKey]?: Database;
	};
	globals[testDatabaseKey] ??= drizzlePglite(
		new PGlite(env.AGENTKOGEI_TEST_DATABASE_PATH),
		{ schema },
	) as unknown as Database;
	return globals[testDatabaseKey];
}

export function createDb() {
	if (blackBoxDatabaseEnabled) {
		return createBlackBoxDb();
	}
	return createNeonDb();
}

export const db = createDb();

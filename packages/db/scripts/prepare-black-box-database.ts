import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const databasePath = process.env.AGENTKOGEI_TEST_DATABASE_PATH;
if (!databasePath) {
	throw new Error("AGENTKOGEI_TEST_DATABASE_PATH is required");
}

const resolvedDatabasePath = resolve(databasePath);
if (!resolvedDatabasePath.endsWith("/.black-box/postgres")) {
	throw new Error("Refusing to replace a database outside .black-box/postgres");
}

await rm(resolvedDatabasePath, { recursive: true, force: true });
await mkdir(dirname(resolvedDatabasePath), { recursive: true });
const database = new PGlite(resolvedDatabasePath);
await database.waitReady;

const migrationsDirectory = new URL("../src/migrations/", import.meta.url);
const migrations = (await readdir(migrationsDirectory))
	.filter((name) => name.endsWith(".sql"))
	.toSorted();

for (const migration of migrations) {
	const source = await readFile(
		new URL(migration, migrationsDirectory),
		"utf8",
	);
	for (const statement of source.split("--> statement-breakpoint")) {
		if (statement.trim()) await database.exec(statement);
	}
}

await database.close();
console.log(
	`Applied ${migrations.length} migrations to isolated PGlite database.`,
);

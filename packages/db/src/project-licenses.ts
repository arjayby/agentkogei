import { eq } from "drizzle-orm";

import { createDb } from "./index";
import { projectLicense } from "./schema/auth";

export type StoredProjectLicense = typeof projectLicense.$inferSelect;
export type NewProjectLicense = typeof projectLicense.$inferInsert;

export async function recordProjectLicense(license: NewProjectLicense) {
	const database = createDb();
	await database.insert(projectLicense).values(license).onConflictDoNothing();
	const [recorded] = await database
		.select()
		.from(projectLicense)
		.where(eq(projectLicense.id, license.id))
		.limit(1);
	return recorded ?? null;
}

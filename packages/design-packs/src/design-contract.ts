import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
	designContractFileName,
	packEvaluationFileName,
	packEvaluationRecordSchema,
} from "./pack-evaluation";
import { packIdentitySchema } from "./pack-identity";
import { packReleaseVersionSchema } from "./release-version";

/**
 * One Pack Release as the Official Catalog delivers it: the raw Markdown a
 * Project installs as its root `DESIGN.md`, and the catalog facts a Builder
 * needs before consenting to Installation. Those facts travel beside the
 * document rather than inside it, so the installed Design Contract stays free
 * of machine metadata.
 */
export const designContractSchema = z
	.object({
		identity: packIdentitySchema,
		designPack: z.string().min(1),
		packRelease: packReleaseVersionSchema,
		packLicense: z.string().min(1),
		access: z.enum(["open", "premium"]),
		markdown: z.string().min(1),
	})
	.strict();

export type DesignContract = z.infer<typeof designContractSchema>;

/**
 * Reads a published Pack Release directory as the Design Contract it delivers.
 * The Markdown is passed through byte for byte, so what Pack Evaluation
 * examined is exactly what a Project receives.
 */
export async function readDesignContract(
	releaseDirectory: string,
): Promise<DesignContract> {
	const [recordContents, markdown] = await Promise.all([
		readFile(path.join(releaseDirectory, packEvaluationFileName), "utf8"),
		readFile(path.join(releaseDirectory, designContractFileName), "utf8"),
	]);
	const record = packEvaluationRecordSchema.parse(JSON.parse(recordContents));
	return {
		identity: record.id,
		designPack: record.name,
		packRelease: record.release.version,
		packLicense: `${record.license.name} (${record.license.spdx})`,
		access: record.access,
		markdown,
	};
}

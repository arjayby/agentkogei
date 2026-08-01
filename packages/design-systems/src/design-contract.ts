import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "./design-system-evaluation";
import { designSystemIdentitySchema } from "./design-system-identity";
import { designSystemReleaseVersionSchema } from "./release-version";

/** The one document a Design System Release publishes, by its fixed name. */
export const designContractFileName = "DESIGN.md";

/** One Design System Release and the raw Markdown a Project installs. */
export const designContractSchema = z
	.object({
		identity: designSystemIdentitySchema,
		designSystem: z.string().min(1),
		designSystemRelease: designSystemReleaseVersionSchema,
		markdown: z.string().min(1),
	})
	.strict();

export type DesignContract = z.infer<typeof designContractSchema>;

/**
 * Reads a published Design System Release directory as the Design Contract it delivers.
 * The Markdown is passed through byte for byte, so what Design System Evaluation
 * examined is exactly what a Project receives.
 */
export async function readDesignContract(
	releaseDirectory: string,
): Promise<DesignContract> {
	const [recordContents, markdown] = await Promise.all([
		readFile(
			path.join(releaseDirectory, designSystemEvaluationFileName),
			"utf8",
		),
		readFile(path.join(releaseDirectory, designContractFileName), "utf8"),
	]);
	const record = designSystemEvaluationRecordSchema.parse(
		JSON.parse(recordContents),
	);
	return {
		identity: record.id,
		designSystem: record.designSystem,
		designSystemRelease: record.designSystemRelease.version,
		markdown,
	};
}

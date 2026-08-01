import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
	packAccessSchema,
	packEvaluationFileName,
	packEvaluationRecordSchema,
} from "./pack-evaluation";
import { packIdentitySchema } from "./pack-identity";
import { packReleaseVersionSchema } from "./release-version";

/** The one document a Pack Release publishes, by its fixed name. */
export const designContractFileName = "DESIGN.md";

/** One Design System Release and the raw Markdown a Project installs. */
export const designSystemContractSchema = z
	.object({
		identity: packIdentitySchema,
		designSystem: z.string().min(1),
		designSystemRelease: packReleaseVersionSchema,
		markdown: z.string().min(1),
	})
	.strict();

export type DesignSystemContract = z.infer<typeof designSystemContractSchema>;

/**
 * Temporary delivery interface retaining legacy fields for consumers migrating
 * in issues #71 and #72. Ticket 7 (#73) removes these fields and access.
 */
export const designContractSchema = designSystemContractSchema
	.extend({
		designPack: z.string().min(1),
		packRelease: packReleaseVersionSchema,
		access: packAccessSchema,
	})
	.superRefine((contract, context) => {
		if (contract.designSystem !== contract.designPack) {
			context.addIssue({
				code: "custom",
				path: ["designSystem"],
				message: "must match temporary legacy designPack",
			});
		}
		if (contract.designSystemRelease !== contract.packRelease) {
			context.addIssue({
				code: "custom",
				path: ["designSystemRelease"],
				message: "must match temporary legacy packRelease",
			});
		}
	});

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
		designSystem: record.designSystem,
		designSystemRelease: record.designSystemRelease.version,
		// TODO(#73): remove the legacy delivery fields after all consumers migrate.
		designPack: record.name,
		packRelease: record.release.version,
		access: record.access,
		markdown,
	};
}

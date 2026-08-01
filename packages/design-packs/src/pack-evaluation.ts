import { z } from "zod";
import { packIdentitySchema } from "./pack-identity";
import { packReleaseVersionSchema } from "./release-version";
import { hasTerminalControl } from "./text-safety";

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const terminalTextSchema = z
	.string()
	.min(1)
	.refine((value) => !hasTerminalControl(value), {
		message: "must not contain terminal control characters",
	});
const relativePathSchema = z
	.string()
	.min(1)
	.refine((value) => !hasTerminalControl(value), {
		message: "must not contain terminal control characters",
	})
	.refine(
		(value) =>
			!value.startsWith("/") &&
			!value.includes("\\") &&
			!value.includes(":") &&
			value
				.split("/")
				.every(
					(segment) => segment !== "" && segment !== "." && segment !== "..",
				),
		{ message: "must be a safe relative path inside the Pack Release" },
	);

/** Whether a Design Pack is an Open or a Premium one. */
export const packAccessSchema = z.enum(["open", "premium"]);

const designSystemReleaseSchema = z
	.object({
		version: packReleaseVersionSchema,
		publishedAt: z.iso.date(),
		immutable: z.literal(true),
	})
	.strict();

/**
 * Canonical publication metadata for one Design System Release. Access is not
 * part of this interface because every Design System is published through the
 * same public catalog.
 */
export const designSystemEvaluationRecordSchema = z
	.object({
		schemaVersion: z.literal("2.0"),
		id: packIdentitySchema,
		designSystem: terminalTextSchema,
		publisher: terminalTextSchema,
		designSystemRelease: designSystemReleaseSchema,
		/**
		 * The one document the release publishes, pinned by digest so an
		 * already-published release cannot be edited under its own version.
		 */
		designContract: z.object({ sha256: sha256Schema }).strict(),
		/** The single stack each first-party Design Contract directly targets. */
		compatibility: z
			.object({
				frameworks: z.array(z.enum(["react", "nextjs"])).min(1),
				react: terminalTextSchema,
				nextjs: terminalTextSchema,
				tailwind: terminalTextSchema,
				ui: z.literal("shadcn/ui"),
			})
			.strict(),
		evaluation: z
			.object({
				status: z.literal("passed"),
				standard: z.literal("WCAG 2.2 Level AA"),
				screens: z.array(z.string()).min(8),
				viewports: z.array(z.string()).min(2),
				colorSchemes: z.array(z.enum(["light", "dark"])).length(2),
				reducedMotion: z.literal(true),
				agentGenerationRuns: z.number().int().min(2),
				automatedChecks: z.array(z.string()).min(1),
				humanReview: z
					.object({
						status: z.literal("passed"),
						reviewedAt: z.iso.date(),
						rightsReview: z.literal("passed"),
					})
					.strict(),
				evidence: z.array(relativePathSchema).min(1),
			})
			.strict(),
		preview: z
			.object({
				summary: z.string().min(1),
				surfaces: z.array(z.string()).min(1),
				route: z.string().startsWith("/"),
			})
			.strict(),
		changelog: z
			.object({
				summary: z.string().min(1),
				breaking: z.boolean(),
				migrationNotes: z.string().min(1).nullable(),
			})
			.strict(),
	})
	.strict();

export type DesignSystemEvaluationRecord = z.infer<
	typeof designSystemEvaluationRecordSchema
>;

/**
 * The temporary publication record accepted while runtime consumers migrate
 * to Design System vocabulary. Issue #73 removes the legacy fields and this
 * compatibility schema after issues #71 and #72 have migrated their consumers.
 */
export const packEvaluationRecordSchema = designSystemEvaluationRecordSchema
	.extend({
		name: terminalTextSchema,
		release: designSystemReleaseSchema,
		access: packAccessSchema,
	})
	.superRefine((record, context) => {
		if (record.designSystem !== record.name) {
			context.addIssue({
				code: "custom",
				path: ["designSystem"],
				message: "must match temporary legacy name",
			});
		}
		if (
			record.designSystemRelease.version !== record.release.version ||
			record.designSystemRelease.publishedAt !== record.release.publishedAt ||
			record.designSystemRelease.immutable !== record.release.immutable
		) {
			context.addIssue({
				code: "custom",
				path: ["designSystemRelease"],
				message: "must match temporary legacy release",
			});
		}
	});

export type PackEvaluationRecord = z.infer<typeof packEvaluationRecordSchema>;

/** The Pack Evaluation record of a Pack Release, by its fixed name. */
export const packEvaluationFileName = "pack-evaluation.json";

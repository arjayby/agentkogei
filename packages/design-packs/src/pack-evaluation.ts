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

/**
 * The file every Pack Release keeps beside its Design Contract, recording what
 * Pack Evaluation examined before the release became a Published Pack. It is
 * internal product tooling: the Official Catalog delivers the Design Contract
 * alone, so nothing here ever reaches a Project.
 */
export const packEvaluationRecordSchema = z
	.object({
		schemaVersion: z.literal("2.0"),
		id: packIdentitySchema,
		name: terminalTextSchema,
		publisher: terminalTextSchema,
		release: z
			.object({
				version: packReleaseVersionSchema,
				publishedAt: z.iso.date(),
				immutable: z.literal(true),
			})
			.strict(),
		access: packAccessSchema,
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

export type PackEvaluationRecord = z.infer<typeof packEvaluationRecordSchema>;

/** The Pack Evaluation record of a Pack Release, by its fixed name. */
export const packEvaluationFileName = "pack-evaluation.json";

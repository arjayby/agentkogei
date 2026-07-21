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
const terminalUrlSchema = z
	.url()
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
		{ message: "must be a safe relative target" },
	);

const fileSchema = z
	.object({
		path: relativePathSchema,
		target: relativePathSchema,
		sha256: sha256Schema,
		mediaType: z.string().min(1),
		mode: z.literal("0644"),
	})
	.strict();

export const packManifestSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
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
		access: z.enum(["open", "premium"]),
		license: z
			.object({
				spdx: terminalTextSchema,
				name: terminalTextSchema,
				url: terminalUrlSchema,
				file: relativePathSchema,
				attribution: terminalTextSchema,
			})
			.strict(),
		designContract: z.literal("DESIGN.md"),
		compatibility: z
			.object({
				frameworkNeutral: z.literal(true),
				adapters: z
					.array(
						z
							.object({
								id: terminalTextSchema,
								frameworks: z.array(z.enum(["react", "nextjs"])).min(1),
								react: terminalTextSchema,
								nextjs: terminalTextSchema,
								tailwind: terminalTextSchema,
								ui: z.literal("shadcn/ui"),
								entry: relativePathSchema,
							})
							.strict(),
					)
					.min(1),
			})
			.strict(),
		files: z.array(fileSchema).min(1),
		dependencies: z
			.object({
				runtime: z.array(z.string()),
				development: z.array(z.string()),
				setup: z.array(terminalTextSchema),
			})
			.strict(),
		provenance: z
			.array(
				z
					.object({
						paths: z.array(relativePathSchema).min(1),
						origin: z.enum(["original", "third-party"]),
						author: z.string().min(1),
						license: z.string().min(1),
						attribution: z.string().min(1),
					})
					.strict(),
			)
			.min(1),
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
				evidence: relativePathSchema,
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

export type PackManifest = z.infer<typeof packManifestSchema>;

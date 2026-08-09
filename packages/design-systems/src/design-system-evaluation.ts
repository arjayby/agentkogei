import { z } from "zod";
import { designSystemIdentitySchema } from "./design-system-identity";
import { designSystemReleaseVersionSchema } from "./release-version";
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
		{
			message: "must be a safe relative path inside the Design System Release",
		},
	);

const previewColorSchema = z
	.string()
	.regex(
		/^(?:#[0-9a-fA-F]{6}|oklch\(\d+(?:\.\d+)? \d+(?:\.\d+)? \d+(?:\.\d+)?\))$/,
		"must be a supported six digit hex or OKLCH preview color",
	);

const previewPaletteSchema = z
	.object({
		background: previewColorSchema,
		foreground: previewColorSchema,
		card: previewColorSchema,
		muted: previewColorSchema,
		mutedForeground: previewColorSchema,
		border: previewColorSchema,
		primary: previewColorSchema,
		primaryForeground: previewColorSchema,
		destructive: previewColorSchema,
		success: previewColorSchema,
		warning: previewColorSchema,
		info: previewColorSchema,
		ring: previewColorSchema,
	})
	.strict();

export const designSystemPreviewSurfaces = [
	"marketing",
	"authentication",
	"onboarding",
	"dashboard",
	"table",
	"form",
	"settings",
	"states",
] as const;

const previewSurfaceSchema = z.enum(designSystemPreviewSurfaces);

const designSystemReleaseSchema = z
	.object({
		version: designSystemReleaseVersionSchema,
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
		schemaVersion: z.literal("3.0"),
		id: designSystemIdentitySchema,
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
				order: z.number().int().positive(),
				summary: terminalTextSchema,
				intendedFit: terminalTextSchema,
				surfaces: z.array(previewSurfaceSchema).length(8),
				route: z.string().startsWith("/"),
				signature: z
					.object({
						label: terminalTextSchema,
						headline: terminalTextSchema,
						principles: z.array(terminalTextSchema).min(3).max(5),
					})
					.strict(),
				tokens: z
					.object({
						light: previewPaletteSchema,
						dark: previewPaletteSchema,
					})
					.strict(),
				typography: z
					.object({
						display: z.enum(["sans", "serif", "mono"]),
						body: z.enum(["sans", "serif", "mono"]),
						accent: z.enum(["sans", "serif", "mono"]),
						scale: z.enum(["compact", "balanced", "expressive"]),
					})
					.strict(),
				geometry: z
					.object({
						density: z.enum(["compact", "balanced", "spacious"]),
						radius: z.enum(["square", "soft", "rounded", "pill"]),
						border: z.enum(["subtle", "defined", "strong"]),
						elevation: z.enum(["flat", "layered"]),
					})
					.strict(),
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

/** The Design System Evaluation record of a Design System Release, by its fixed name. */
export const designSystemEvaluationFileName = "design-system-evaluation.json";

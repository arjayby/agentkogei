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

const previewTokensSchema = z
	.object({
		light: previewPaletteSchema,
		dark: previewPaletteSchema,
	})
	.strict();

const previewGeometrySchema = z
	.object({
		density: z.enum(["compact", "balanced", "spacious"]),
		radius: z.enum(["square", "soft", "rounded", "pill"]),
		border: z.enum(["subtle", "defined", "strong"]),
		elevation: z.enum(["flat", "layered"]),
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

export const designSystemMarkRecipes = [
	"structural-planes",
	"page-leaves",
	"nested-apertures",
	"directional-nodes",
	"relay-loop",
	"specimen-frame",
	"pulse-sequence",
	"lumen-window",
] as const;

export const designSystemPreviewFontChoices = [
	"geometric-sans",
	"humanist-sans",
	"editorial-serif",
	"neo-grotesk",
	"technical-mono",
] as const;

const previewFontSchema = z.enum(designSystemPreviewFontChoices);

const semanticColorUsageSchema = z
	.object({
		background: terminalTextSchema,
		foreground: terminalTextSchema,
		card: terminalTextSchema,
		muted: terminalTextSchema,
		mutedForeground: terminalTextSchema,
		border: terminalTextSchema,
		primary: terminalTextSchema,
		primaryForeground: terminalTextSchema,
		destructive: terminalTextSchema,
		success: terminalTextSchema,
		warning: terminalTextSchema,
		info: terminalTextSchema,
		ring: terminalTextSchema,
	})
	.strict();

const typographyRoleSchema = z
	.object({
		font: z.enum(["display", "body", "accent"]),
		sizeRem: z
			.object({
				mobile: z.number().positive(),
				desktop: z.number().positive(),
			})
			.strict(),
		weight: z.number().int().min(100).max(900).multipleOf(100),
		lineHeight: z.number().min(0.8).max(2),
		trackingEm: z.number().min(-0.1).max(0.5),
		usage: terminalTextSchema,
	})
	.strict();

const spacingStepSchema = z
	.object({
		valueRem: z.number().nonnegative(),
		usage: terminalTextSchema,
	})
	.strict();

const namedSpecimenSchema = z
	.string()
	.min(1)
	.regex(/^[a-z0-9-]+$/);

function specimenRecord<Value extends z.ZodType>(
	value: Value,
	minimum: number,
) {
	return z
		.record(namedSpecimenSchema, value)
		.refine(
			(record) => Object.keys(record).length >= minimum,
			`must define at least ${minimum} named specimens`,
		);
}

const responsiveModeSchema = z
	.object({
		minWidthPx: z.number().int().positive(),
		guidance: terminalTextSchema,
	})
	.strict();

const radiusSpecimenSchema = z
	.object({
		valueRem: z.number().nonnegative(),
		usage: terminalTextSchema,
	})
	.strict();

const borderSpecimenSchema = z
	.object({
		widthPx: z.number().nonnegative(),
		style: z.enum(["solid", "dashed"]),
		usage: terminalTextSchema,
	})
	.strict();

const elevationSpecimenSchema = z
	.object({
		offsetYRem: z.number().nonnegative(),
		blurRem: z.number().nonnegative(),
		spreadRem: z.number().max(0),
		opacity: z.number().min(0).max(1),
		usage: terminalTextSchema,
	})
	.strict();

const previewFoundationsSchema = z
	.object({
		semanticColorUsage: semanticColorUsageSchema,
		typographyScale: specimenRecord(typographyRoleSchema, 4),
		spacingScale: specimenRecord(spacingStepSchema, 6),
		layout: z
			.object({
				maxWidthRem: z.number().positive(),
				contentWidthCh: z.number().positive(),
				columns: z
					.object({
						mobile: z.number().int().positive(),
						tablet: z.number().int().positive(),
						desktop: z.number().int().positive(),
					})
					.strict(),
				gutterRem: z
					.object({
						mobile: z.number().positive(),
						tablet: z.number().positive(),
						desktop: z.number().positive(),
					})
					.strict(),
				guidance: terminalTextSchema,
			})
			.strict(),
		responsive: z
			.object({
				mobile: responsiveModeSchema,
				tablet: responsiveModeSchema,
				desktop: responsiveModeSchema,
				zoom: z
					.object({
						scalePercent: z.literal(200),
						guidance: terminalTextSchema,
					})
					.strict(),
				reflow: z
					.object({
						widthPx: z.literal(320),
						guidance: terminalTextSchema,
					})
					.strict(),
			})
			.strict(),
		geometry: z
			.object({
				radii: specimenRecord(radiusSpecimenSchema, 1),
				borders: specimenRecord(borderSpecimenSchema, 1),
				elevation: specimenRecord(elevationSpecimenSchema, 1),
			})
			.strict(),
	})
	.strict();

const interactionStateGuidanceSchema = z
	.object({
		default: terminalTextSchema,
		hover: terminalTextSchema,
		focus: terminalTextSchema,
		active: terminalTextSchema,
		disabled: terminalTextSchema,
		loading: terminalTextSchema,
		success: terminalTextSchema,
		error: terminalTextSchema,
	})
	.strict();

const previewControlsSchema = z
	.object({
		buttons: z
			.object({
				primaryLabel: terminalTextSchema,
				secondaryLabel: terminalTextSchema,
				guidance: terminalTextSchema,
				states: interactionStateGuidanceSchema,
			})
			.strict(),
		links: z
			.object({
				primaryLabel: terminalTextSchema,
				secondaryLabel: terminalTextSchema,
				guidance: terminalTextSchema,
				states: interactionStateGuidanceSchema,
			})
			.strict(),
		forms: z
			.object({
				legend: terminalTextSchema,
				guidance: terminalTextSchema,
				submitLabel: terminalTextSchema,
				help: terminalTextSchema,
				error: terminalTextSchema,
				success: terminalTextSchema,
			})
			.strict(),
		inputs: z
			.object({
				textLabel: terminalTextSchema,
				textPlaceholder: terminalTextSchema,
				textareaLabel: terminalTextSchema,
				textareaPlaceholder: terminalTextSchema,
				disabledLabel: terminalTextSchema,
				guidance: terminalTextSchema,
			})
			.strict(),
		cards: z
			.object({
				title: terminalTextSchema,
				description: terminalTextSchema,
				metadata: terminalTextSchema,
				actionLabel: terminalTextSchema,
				guidance: terminalTextSchema,
			})
			.strict(),
		panels: z
			.object({
				title: terminalTextSchema,
				description: terminalTextSchema,
				items: z.array(terminalTextSchema).min(2),
				guidance: terminalTextSchema,
			})
			.strict(),
		navigation: z
			.object({
				label: terminalTextSchema,
				items: z
					.array(
						z
							.object({
								id: namedSpecimenSchema,
								label: terminalTextSchema,
							})
							.strict(),
					)
					.min(3),
				guidance: terminalTextSchema,
			})
			.strict(),
	})
	.strict();

const previewStatusToneSchema = z.enum([
	"neutral",
	"info",
	"success",
	"warning",
	"destructive",
]);

const previewInteractionsSchema = z
	.object({
		dataDisplay: z
			.object({
				tableCaption: terminalTextSchema,
				columns: z
					.array(
						z
							.object({
								id: namedSpecimenSchema,
								label: terminalTextSchema,
							})
							.strict(),
					)
					.min(2),
				rows: z
					.array(
						z
							.object({
								id: namedSpecimenSchema,
								label: terminalTextSchema,
								cells: z.array(terminalTextSchema).min(2),
							})
							.strict(),
					)
					.min(2),
				listLabel: terminalTextSchema,
				listItems: z
					.array(
						z
							.object({
								title: terminalTextSchema,
								description: terminalTextSchema,
								status: terminalTextSchema,
							})
							.strict(),
					)
					.min(3),
				guidance: terminalTextSchema,
				overflowGuidance: terminalTextSchema,
			})
			.strict()
			.superRefine((dataDisplay, context) => {
				if (
					new Set(dataDisplay.columns.map(({ id }) => id)).size !==
					dataDisplay.columns.length
				) {
					context.addIssue({
						code: "custom",
						path: ["columns"],
						message: "table column identifiers must be unique",
					});
				}
				for (const [index, row] of dataDisplay.rows.entries()) {
					if (row.cells.length !== dataDisplay.columns.length - 1) {
						context.addIssue({
							code: "custom",
							path: ["rows", index, "cells"],
							message:
								"table rows must define one cell for every nonheading column",
						});
					}
				}
			}),
		feedback: z
			.object({
				badges: z
					.array(
						z
							.object({
								label: terminalTextSchema,
								meaning: terminalTextSchema,
								tone: previewStatusToneSchema,
							})
							.strict(),
					)
					.min(4),
				alerts: z
					.array(
						z
							.object({
								title: terminalTextSchema,
								description: terminalTextSchema,
								tone: previewStatusToneSchema,
							})
							.strict(),
					)
					.min(2),
				states: z
					.object({
						loading: terminalTextSchema,
						empty: terminalTextSchema,
						filteredEmpty: terminalTextSchema,
						error: terminalTextSchema,
						success: terminalTextSchema,
						disabled: terminalTextSchema,
						destructive: terminalTextSchema,
					})
					.strict(),
				guidance: terminalTextSchema,
				nonColorGuidance: terminalTextSchema,
			})
			.strict(),
		dialogs: z
			.object({
				title: terminalTextSchema,
				description: terminalTextSchema,
				openLabel: terminalTextSchema,
				initialFocusLabel: terminalTextSchema,
				confirmLabel: terminalTextSchema,
				closeLabel: terminalTextSchema,
				guidance: terminalTextSchema,
				escapeBehavior: terminalTextSchema,
				focusRestoration: terminalTextSchema,
			})
			.strict(),
		destructiveActions: z
			.object({
				objectLabel: terminalTextSchema,
				consequence: terminalTextSchema,
				recoverability: terminalTextSchema,
				openLabel: terminalTextSchema,
				confirmLabel: terminalTextSchema,
				cancelLabel: terminalTextSchema,
				guidance: terminalTextSchema,
			})
			.strict(),
	})
	.strict();

const previewMotionEasingSchema = z.enum([
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
]);

const previewMotionSchema = z
	.object({
		durationMs: z
			.object({
				feedback: z.number().int().min(50).max(1000),
				transition: z.number().int().min(50).max(1000),
				spatial: z.number().int().min(50).max(1000),
			})
			.strict(),
		easing: z
			.object({
				enter: previewMotionEasingSchema,
				exit: previewMotionEasingSchema,
				move: previewMotionEasingSchema,
			})
			.strict(),
		movement: z
			.object({
				distanceRem: z.number().positive().max(4),
				scaleFrom: z.number().min(0.8).max(1),
			})
			.strict(),
		guidance: terminalTextSchema,
		autoplay: z.literal(false),
	})
	.strict()
	.superRefine((motion, context) => {
		const { feedback, transition, spatial } = motion.durationMs;
		if (!(feedback <= transition && transition <= spatial)) {
			context.addIssue({
				code: "custom",
				path: ["durationMs"],
				message:
					"motion durations must progress from feedback through transition to spatial movement",
			});
		}
	});

const previewReducedMotionSchema = z
	.object({
		removeNonessential: z.literal(true),
		stateChanges: z.literal("instant"),
		guidance: terminalTextSchema,
	})
	.strict();

const previewAccessibilitySchema = z
	.object({
		standard: z.literal("WCAG 2.2 Level AA"),
		semantics: terminalTextSchema,
		keyboard: terminalTextSchema,
		focus: terminalTextSchema,
		contrast: terminalTextSchema,
		targetSize: terminalTextSchema,
		zoom: terminalTextSchema,
		reflow: terminalTextSchema,
		forcedColors: terminalTextSchema,
		statusCommunication: terminalTextSchema,
	})
	.strict();

const previewProductSurfaceExampleSchema = z
	.object({
		title: terminalTextSchema,
		description: terminalTextSchema,
		elements: z.array(terminalTextSchema).min(2),
	})
	.strict();

const previewProductSurfacesSchema = z
	.object({
		guidance: terminalTextSchema,
		examples: z
			.object({
				marketing: previewProductSurfaceExampleSchema,
				authentication: previewProductSurfaceExampleSchema,
				onboarding: previewProductSurfaceExampleSchema,
				dashboard: previewProductSurfaceExampleSchema,
				table: previewProductSurfaceExampleSchema,
				form: previewProductSurfaceExampleSchema,
				settings: previewProductSurfaceExampleSchema,
				states: previewProductSurfaceExampleSchema,
			})
			.strict(),
	})
	.strict();

const previewEvidencePresentationSchema = z
	.object({
		preview: terminalTextSchema,
		designContract: terminalTextSchema,
		evaluation: terminalTextSchema,
		rawEvidencePublic: z.literal(true),
	})
	.strict();

export const designSystemPreviewSchema = z
	.object({
		order: z.number().int().positive(),
		summary: terminalTextSchema,
		intendedFit: terminalTextSchema,
		route: z.string().startsWith("/"),
		signature: z
			.object({
				label: terminalTextSchema,
				headline: terminalTextSchema,
				principles: z.array(terminalTextSchema).min(3).max(5),
			})
			.strict(),
		mark: z
			.object({
				recipe: z.enum(designSystemMarkRecipes),
				label: terminalTextSchema,
			})
			.strict(),
		typography: z
			.object({
				display: previewFontSchema,
				body: previewFontSchema,
				accent: previewFontSchema,
				control: previewFontSchema.optional(),
			})
			.strict(),
		composition: z.enum([
			"balanced-grid",
			"reading-column",
			"focal-frame",
			"operational-frame",
			"process-bands",
			"catalog-field",
		]),
		foundations: previewFoundationsSchema,
		controls: previewControlsSchema,
		interactions: previewInteractionsSchema,
		motion: previewMotionSchema,
		reducedMotion: previewReducedMotionSchema,
		accessibility: previewAccessibilitySchema,
		productSurfaces: previewProductSurfacesSchema,
		evidencePresentation: previewEvidencePresentationSchema,
		theme: z
			.object({
				tokens: previewTokensSchema,
				schemeOrder: z
					.union([
						z.tuple([z.literal("light"), z.literal("dark")]),
						z.tuple([z.literal("dark"), z.literal("light")]),
					])
					.optional(),
				geometry: previewGeometrySchema,
			})
			.strict(),
	})
	.strict();

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
const designSystemEvaluationRecordShape = {
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
	preview: designSystemPreviewSchema,
	changelog: z
		.object({
			summary: z.string().min(1),
			breaking: z.boolean(),
			migrationNotes: z.string().min(1).nullable(),
		})
		.strict(),
} as const;

const commonEvaluationShape = {
	status: z.literal("passed"),
	standard: z.literal("WCAG 2.2 Level AA"),
	screens: z.array(z.string()).min(8),
	viewports: z.array(z.string()).min(2),
	colorSchemes: z.array(z.enum(["light", "dark"])).length(2),
	reducedMotion: z.literal(true),
	automatedChecks: z.array(z.string()).min(1),
	evidence: z.array(relativePathSchema).min(1),
} as const;

const versionFourDesignSystemEvaluationRecordSchema = z
	.object({
		schemaVersion: z.literal("4.0"),
		...designSystemEvaluationRecordShape,
		evaluation: z
			.object({
				...commonEvaluationShape,
				agentGenerationRuns: z.number().int().min(2),
				humanReview: z
					.object({
						status: z.literal("passed"),
						reviewedAt: z.iso.date(),
						rightsReview: z.literal("passed"),
					})
					.strict(),
			})
			.strict(),
	})
	.strict();

const versionFiveDesignSystemEvaluationRecordSchema = z
	.object({
		schemaVersion: z.literal("5.0"),
		...designSystemEvaluationRecordShape,
		evaluation: z
			.object({
				...commonEvaluationShape,
				agentGenerationRuns: z.number().int().min(1),
			})
			.strict(),
	})
	.strict();

/**
 * Version 4 records preserve the historical gated workflow. Version 5 records
 * are produced by the single pass Add Design System workflow and therefore
 * carry verification evidence without approval metadata.
 */
export const designSystemEvaluationRecordSchema = z.discriminatedUnion(
	"schemaVersion",
	[
		versionFourDesignSystemEvaluationRecordSchema,
		versionFiveDesignSystemEvaluationRecordSchema,
	],
);

export type DesignSystemEvaluationRecord = z.infer<
	typeof designSystemEvaluationRecordSchema
>;

/** The Design System Evaluation record of a Design System Release, by its fixed name. */
export const designSystemEvaluationFileName = "design-system-evaluation.json";

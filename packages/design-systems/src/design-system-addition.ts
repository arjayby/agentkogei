import { z } from "zod";
import { hasHiddenDocumentControl } from "./text-safety";

const safeTextSchema = z
	.string()
	.trim()
	.min(1)
	.refine((value) => !hasHiddenDocumentControl(value), {
		message: "must not contain hidden control characters",
	});

const excludedElements = [
	"copied assets",
	"product identity",
	"distinctive compositions",
	"recognizable product replication",
	"imitation of living designers",
] as const;

const urlReferenceSchema = z
	.object({
		kind: z.literal("url"),
		locator: z
			.url()
			.refine((value) => new URL(value).protocol === "https:", "must use HTTPS")
			.refine((value) => {
				const url = new URL(value);
				return (
					url.search === "" &&
					url.hash === "" &&
					url.username === "" &&
					url.password === ""
				);
			}, "must omit query parameters, fragments, and credentials"),
		inspectedPages: z
			.array(
				z
					.object({
						path: z
							.string()
							.startsWith("/")
							.refine(
								(value) => !value.includes("?") && !value.includes("#"),
								"must omit query parameters and fragments",
							),
						scope: safeTextSchema,
						reachedBottom: z.literal(true),
					})
					.strict(),
			)
			.min(1)
			.max(4),
		additionalPages: z
			.object({
				inspected: z.number().int().min(0).max(3),
				limitation: safeTextSchema.nullable(),
			})
			.strict(),
		generalizedTraits: z.array(safeTextSchema).min(3),
		transformation: safeTextSchema,
		excludedElements: z.array(z.enum(excludedElements)).length(5),
	})
	.strict()
	.superRefine((reference, context) => {
		if (
			new Set(reference.inspectedPages.map(({ path }) => path)).size !==
			reference.inspectedPages.length
		) {
			context.addIssue({
				code: "custom",
				path: ["inspectedPages"],
				message: "must contain unique page paths",
			});
		}
		if (
			new URL(reference.locator).pathname !== reference.inspectedPages[0]?.path
		) {
			context.addIssue({
				code: "custom",
				path: ["inspectedPages", 0, "path"],
				message: "must match the supplied reference URL path",
			});
		}
		if (
			reference.additionalPages.inspected !==
			reference.inspectedPages.length - 1
		) {
			context.addIssue({
				code: "custom",
				path: ["additionalPages", "inspected"],
				message: "must match the additional inspected page count",
			});
		}
		if (
			reference.additionalPages.inspected < 2 &&
			reference.additionalPages.limitation === null
		) {
			context.addIssue({
				code: "custom",
				path: ["additionalPages", "limitation"],
				message:
					"must explain why fewer than two useful additional pages were available",
			});
		}
	});

const imageReferenceSchema = z
	.object({
		kind: z.literal("image"),
		locator: z.literal("user-supplied-image"),
		inspectedScope: safeTextSchema,
		generalizedTraits: z.array(safeTextSchema).min(3),
		transformation: safeTextSchema,
		excludedElements: z.array(z.enum(excludedElements)).length(5),
	})
	.strict();

export const designSystemAdditionReportSchema = z
	.object({
		schemaVersion: z.literal("2.0"),
		status: z.literal("passed"),
		designSystem: safeTextSchema,
		designReference: z.discriminatedUnion("kind", [
			urlReferenceSchema,
			imageReferenceSchema,
		]),
		screens: z
			.array(
				z.enum([
					"marketing",
					"authentication",
					"onboarding",
					"dashboard",
					"table",
					"form",
					"settings",
					"states",
				]),
			)
			.length(8),
		coverage: z
			.object({
				viewports: z.tuple([z.literal("1440x900"), z.literal("390x844")]),
				colorSchemes: z.tuple([z.literal("light"), z.literal("dark")]),
				reducedMotion: z.literal(true),
			})
			.strict(),
		automatedChecks: z
			.object({
				structure: z.literal("passed"),
				accessibility: z.literal("passed"),
				responsiveOverflow: z.literal("passed"),
				colorContrast: z.literal("passed"),
			})
			.strict(),
		originalityReview: z
			.object({ status: z.literal("passed"), notes: safeTextSchema })
			.strict(),
	})
	.strict()
	.superRefine((report, context) => {
		if (new Set(report.screens).size !== 8) {
			context.addIssue({
				code: "custom",
				path: ["screens"],
				message: "must contain every required screen exactly once",
			});
		}
		if (new Set(report.designReference.excludedElements).size !== 5) {
			context.addIssue({
				code: "custom",
				path: ["designReference", "excludedElements"],
				message: "must contain every excluded element exactly once",
			});
		}
	});

export type DesignSystemAdditionReport = z.infer<
	typeof designSystemAdditionReportSchema
>;

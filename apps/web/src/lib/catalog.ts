export type DesignSystemRelease = {
	version: `${number}.${number}.${number}`;
	publishedAt: string;
	changelog: string;
};

export type DesignSystem = {
	slug: "foundation" | "editorial" | "mono" | "command";
	name: string;
	direction: string;
	bestFor: string;
	/** Published Design System Releases, newest first. The first is what a bare identity selects. */
	releases: readonly [DesignSystemRelease, ...DesignSystemRelease[]];
	compatibility: string;
	evaluation: string;
	evaluationEvidence: readonly string[];
	coverage: readonly string[];
};

const coverage = [
	"Marketing pages",
	"Onboarding flows",
	"Dashboard and product UI",
	"Forms, settings, and tables",
	"Loading, empty, error, and success states",
	"Responsive, dark mode, and reduced motion",
] as const;

/**
 * The sections every Published Design System consolidates into its Design Contract.
 * Installation writes one root `DESIGN.md`, so this describes that document's
 * own content rather than a set of files a Builder receives.
 */
export const contractSections = [
	"Interface principles, layout, and product surfaces",
	"Semantic tokens and their definitions",
	"Components, interaction states, and feedback",
	"Motion and accessibility direction",
	"Agent instructions and worked examples",
	"A final validation checklist",
	"React or Next.js, Tailwind CSS v4, and shadcn/ui implementation direction",
] as const;

const compatibility = "React / Next.js · Tailwind CSS v4 · shadcn/ui";
const evaluation =
	"Design System Evaluation passed · WCAG 2.2 Level AA reference implementation";
const evaluationEvidence = [
	"Desktop 1440×900 and mobile 390×844",
	"Light, dark, and reduced motion",
	"Human visual and accessibility review passed",
] as const;

export const designSystems: readonly DesignSystem[] = [
	{
		slug: "foundation",
		name: "Foundation",
		direction: "Neutral, crisp, and highly legible B2B SaaS.",
		bestFor: "Versatile product foundations",
		releases: [
			{
				version: "1.1.0",
				publishedAt: "July 19, 2026",
				changelog:
					"Adds semantic informational-state tokens and detailed responsive pagination direction.",
			},
			{
				version: "1.0.0",
				publishedAt: "July 18, 2026",
				changelog:
					"Initial Published Design System with complete cross-surface coverage and evaluation evidence.",
			},
		],
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "editorial",
		name: "Editorial",
		direction: "Warm, spacious, and content-forward SaaS.",
		bestFor: "Knowledge and content products",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 19, 2026",
				changelog:
					"Initial Published Design System with complete cross-surface coverage and evaluation evidence.",
			},
		],
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "mono",
		name: "Mono",
		direction: "Monochrome, high-contrast, and content-forward.",
		bestFor: "Media and creative tooling",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 25, 2026",
				changelog:
					"Initial Published Design System with complete cross-surface coverage and evaluation evidence.",
			},
		],
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "command",
		name: "Command",
		direction: "Dark-first, dense, and technical.",
		bestFor: "Developer and operations products",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 18, 2026",
				changelog:
					"Initial Published Design System with dense technical patterns and complete state coverage.",
			},
		],
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
] as const;

export function getDesignSystem(slug: string) {
	return designSystems.find((designSystem) => designSystem.slug === slug);
}

/** The Design System Release a bare identity selects. */
export function currentRelease(designSystem: DesignSystem) {
	return designSystem.releases[0];
}

/**
 * The newest Design System Releases across the catalog, newest first. Only each
 * Design System's
 * current release can qualify, and catalog order breaks publication-date ties.
 */
export function recentDesignSystemReleases(count: number) {
	return designSystems
		.map((designSystem) => ({
			designSystem,
			release: currentRelease(designSystem),
		}))
		.sort(
			(a, b) =>
				Date.parse(b.release.publishedAt) - Date.parse(a.release.publishedAt),
		)
		.slice(0, count);
}

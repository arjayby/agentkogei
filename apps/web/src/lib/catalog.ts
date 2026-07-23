export type PackAccess = "Open" | "Premium";

export type PackRelease = {
	version: `${number}.${number}.${number}`;
	publishedAt: string;
	changelog: string;
};

export type DesignPack = {
	slug: "foundation" | "editorial" | "command" | "signal";
	name: string;
	access: PackAccess;
	direction: string;
	bestFor: string;
	/** Published Pack Releases, newest first. The first is what a bare identity selects. */
	releases: readonly [PackRelease, ...PackRelease[]];
	license: "CC BY 4.0" | "Commercial Pack License";
	licenseSummary: string;
	compatibility: string;
	evaluation: string;
	evaluationEvidence: readonly string[];
	coverage: readonly string[];
};

const coverage = [
	"Marketing and pricing",
	"Authentication and onboarding",
	"Dashboard and product UI",
	"Forms, settings, and tables",
	"Loading, empty, error, and success states",
	"Responsive, dark mode, and reduced motion",
] as const;

/**
 * The sections every Published Pack consolidates into its Design Contract.
 * Installation writes one root `DESIGN.md`, so this describes that document's
 * own content rather than a set of files a Builder receives. Open and Premium
 * Design Packs meet the same publication standard, so the list does not vary
 * by pack.
 */
export const contractSections = [
	"Interface principles, layout, and product surfaces",
	"Semantic tokens and their definitions",
	"Components, interaction states, and feedback",
	"Motion and accessibility direction",
	"Agent instructions and worked examples",
	"A final validation checklist",
	"React or Next.js, Tailwind CSS v4, and shadcn/ui implementation direction",
	"Attribution, Pack License, and Pack Release provenance",
] as const;

/** What Premium Access buys, stated without promising anything beside the document. */
export const premiumValueStatement =
	"Premium value comes from creative distinctiveness, production depth, and breadth of direction inside that same single document.";

const compatibility = "React / Next.js · Tailwind CSS v4 · shadcn/ui";
const evaluation =
	"Pack Evaluation passed · WCAG 2.2 Level AA reference implementation";
const evaluationEvidence = [
	"Desktop 1440×900 and mobile 390×844",
	"Light, dark, and reduced motion",
	"Human visual, accessibility, and rights review passed",
] as const;

export const designPacks: readonly DesignPack[] = [
	{
		slug: "foundation",
		name: "Foundation",
		access: "Open",
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
					"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
			},
		],
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "editorial",
		name: "Editorial",
		access: "Open",
		direction: "Warm, spacious, and content-forward SaaS.",
		bestFor: "Knowledge and content products",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 19, 2026",
				changelog:
					"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
			},
		],
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "command",
		name: "Command",
		access: "Premium",
		direction: "Dark-first, dense, and technical.",
		bestFor: "Developer and operations products",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 18, 2026",
				changelog:
					"Initial Published Pack with dense technical patterns and complete state coverage.",
			},
		],
		license: "Commercial Pack License",
		licenseSummary:
			"A snapshot installed while access is active remains licensed in that Project after Premium Access expires; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
	{
		slug: "signal",
		name: "Signal",
		access: "Premium",
		direction: "Bold geometry, expressive color, and richer motion.",
		bestFor: "AI and creative products",
		releases: [
			{
				version: "1.0.0",
				publishedAt: "July 20, 2026",
				changelog:
					"Initial Published Pack with expressive motion direction and full surface coverage.",
			},
		],
		license: "Commercial Pack License",
		licenseSummary:
			"A snapshot installed while access is active remains licensed in that Project after Premium Access expires; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
	},
] as const;

export function getDesignPack(slug: string) {
	return designPacks.find((pack) => pack.slug === slug);
}

/** The Pack Release a bare Design Pack identity selects. */
export function currentRelease(pack: DesignPack) {
	return pack.releases[0];
}

/**
 * The newest Pack Releases across the catalog, newest first. Only each pack's
 * current release can qualify, and catalog order breaks publication-date ties.
 */
export function recentPackReleases(count: number) {
	return designPacks
		.map((pack) => ({ pack, release: currentRelease(pack) }))
		.sort(
			(a, b) =>
				Date.parse(b.release.publishedAt) - Date.parse(a.release.publishedAt),
		)
		.slice(0, count);
}

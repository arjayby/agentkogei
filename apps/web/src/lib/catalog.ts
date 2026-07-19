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
	release: PackRelease;
	license: "CC BY 4.0" | "Commercial Pack License";
	licenseSummary: string;
	compatibility: string;
	evaluation: string;
	evaluationEvidence: readonly string[];
	coverage: readonly string[];
	resources: readonly string[];
};

const coverage = [
	"Marketing and pricing",
	"Authentication and onboarding",
	"Dashboard and product UI",
	"Forms, settings, and tables",
	"Loading, empty, error, and success states",
	"Responsive, dark mode, and reduced motion",
] as const;

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
		release: {
			version: "1.0.0",
			publishedAt: "July 18, 2026",
			changelog:
				"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
		},
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
		resources: [
			"Design Contract (DESIGN.md)",
			"Semantic token definitions",
			"Component and state guidance",
			"React and Next.js Stack Adapter",
		],
	},
	{
		slug: "editorial",
		name: "Editorial",
		access: "Open",
		direction: "Warm, spacious, and content-forward SaaS.",
		bestFor: "Knowledge and content products",
		release: {
			version: "1.0.0",
			publishedAt: "July 19, 2026",
			changelog:
				"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
		},
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
		resources: [
			"Design Contract (DESIGN.md)",
			"Editorial typography tokens",
			"Content and component guidance",
			"React and Next.js Stack Adapter",
		],
	},
	{
		slug: "command",
		name: "Command",
		access: "Premium",
		direction: "Dark-first, dense, and technical.",
		bestFor: "Developer and operations products",
		release: {
			version: "1.0.0",
			publishedAt: "July 18, 2026",
			changelog:
				"Initial Published Pack with dense technical patterns and complete state coverage.",
		},
		license: "Commercial Pack License",
		licenseSummary:
			"A snapshot installed while access is active remains licensed in that Project after Premium Access expires; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
		resources: [
			"Core interface direction",
			"Dense semantic token system",
			"Technical component and state recipes",
			"Operations-focused supporting resources",
		],
	},
	{
		slug: "signal",
		name: "Signal",
		access: "Premium",
		direction: "Bold geometry, expressive color, and richer motion.",
		bestFor: "AI and creative products",
		release: {
			version: "1.0.0",
			publishedAt: "July 18, 2026",
			changelog:
				"Initial Published Pack with expressive motion, graphic resources, and full surface coverage.",
		},
		license: "Commercial Pack License",
		licenseSummary:
			"A snapshot installed while access is active remains licensed in that Project after Premium Access expires; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		evaluationEvidence,
		coverage,
		resources: [
			"Core interface direction",
			"Expressive semantic token system",
			"Motion and component recipes",
			"Original graphic resource kit",
		],
	},
] as const;

export function getDesignPack(slug: string) {
	return designPacks.find((pack) => pack.slug === slug);
}

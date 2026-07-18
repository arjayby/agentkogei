export type PackAccess = "Open" | "Premium";

export type DesignPack = {
	slug: "foundation" | "editorial" | "command" | "signal";
	name: string;
	access: PackAccess;
	direction: string;
	bestFor: string;
	release: string;
	publishedAt: string;
	license: "CC BY 4.0" | "Commercial Pack License";
	licenseSummary: string;
	compatibility: string;
	evaluation: string;
	coverage: readonly string[];
	resources: readonly string[];
	changelog: string;
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

export const designPacks: readonly DesignPack[] = [
	{
		slug: "foundation",
		name: "Foundation",
		access: "Open",
		direction: "Neutral, crisp, and highly legible B2B SaaS.",
		bestFor: "Versatile product foundations",
		release: "1.0.0",
		publishedAt: "July 18, 2026",
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		coverage,
		resources: [
			"Design Contract (DESIGN.md)",
			"Semantic token definitions",
			"Component and state guidance",
			"React and Next.js Stack Adapter",
		],
		changelog:
			"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
	},
	{
		slug: "editorial",
		name: "Editorial",
		access: "Open",
		direction: "Warm, spacious, and content-forward SaaS.",
		bestFor: "Knowledge and content products",
		release: "1.0.0",
		publishedAt: "July 18, 2026",
		license: "CC BY 4.0",
		licenseSummary:
			"Complete Open Design Pack content, reusable with attribution.",
		compatibility,
		evaluation,
		coverage,
		resources: [
			"Design Contract (DESIGN.md)",
			"Editorial typography tokens",
			"Content and component guidance",
			"React and Next.js Stack Adapter",
		],
		changelog:
			"Initial Published Pack with complete cross-surface coverage and evaluation evidence.",
	},
	{
		slug: "command",
		name: "Command",
		access: "Premium",
		direction: "Dark-first, dense, and technical.",
		bestFor: "Developer and operations products",
		release: "1.0.0",
		publishedAt: "July 18, 2026",
		license: "Commercial Pack License",
		licenseSummary:
			"Licensed for an installed Project snapshot while Premium Access is active; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		coverage,
		resources: [
			"Core interface direction",
			"Dense semantic token system",
			"Technical component and state recipes",
			"Operations-focused supporting resources",
		],
		changelog:
			"Initial Published Pack with dense technical patterns and complete state coverage.",
	},
	{
		slug: "signal",
		name: "Signal",
		access: "Premium",
		direction: "Bold geometry, expressive color, and richer motion.",
		bestFor: "AI and creative products",
		release: "1.0.0",
		publishedAt: "July 18, 2026",
		license: "Commercial Pack License",
		licenseSummary:
			"Licensed for an installed Project snapshot while Premium Access is active; extraction and reuse elsewhere are not included.",
		compatibility,
		evaluation,
		coverage,
		resources: [
			"Core interface direction",
			"Expressive semantic token system",
			"Motion and component recipes",
			"Original graphic resource kit",
		],
		changelog:
			"Initial Published Pack with expressive motion, graphic resources, and full surface coverage.",
	},
] as const;

export function getDesignPack(slug: string) {
	return designPacks.find((pack) => pack.slug === slug);
}

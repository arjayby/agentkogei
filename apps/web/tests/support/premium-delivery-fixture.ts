import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

type RegistryFile = {
	path: string;
	type: "registry:file";
	target: string;
	content: string;
};

type RegistryItem = {
	name: string;
	title: string;
	description: string;
	files: RegistryFile[];
};

type PackManifest = {
	id: string;
	name: string;
	publisher: string;
	access: string;
	release: { publishedAt: string };
	license: Record<string, string>;
	files: Array<{
		path: string;
		target: string;
		sha256: string;
		mediaType: string;
		mode: "0644";
	}>;
	provenance: Array<{
		paths: string[];
		origin: "original" | "third-party";
		author: string;
		license: string;
		attribution: string;
	}>;
	evaluation: { agentGenerationRuns: number };
	preview: { summary: string; surfaces: string[]; route: string };
	changelog: { summary: string };
};

function sha256(contents: string) {
	return createHash("sha256").update(contents).digest("hex");
}

/**
 * The published Foundation release, used only as the structural skeleton these
 * synthetic protected releases are shaped from. Every byte of design direction
 * a test release carries is replaced with its own.
 */
function foundationRegistryItem() {
	return JSON.parse(
		readFileSync(path.resolve("public/r/foundation/1.0.0.json"), "utf8"),
	) as RegistryItem;
}

function mediaTypeOf(resourcePath: string) {
	if (resourcePath.endsWith(".json")) return "application/json";
	if (resourcePath.endsWith(".css")) return "text/css";
	if (resourcePath.endsWith(".svg")) return "image/svg+xml";
	return "text/markdown";
}

export function buildTestPremiumDeliveryFixture() {
	const fixture = foundationRegistryItem();
	fixture.name = "delivery-fixture";
	fixture.title = "Delivery Fixture";
	fixture.description = "Controlled non-catalog fixture for premium delivery.";
	for (const file of fixture.files) {
		file.target = file.target.replace(
			".agentkogei/foundation/",
			".agentkogei/delivery-fixture/",
		);
	}

	const design = fixture.files.find((file) => file.path === "DESIGN.md");
	const license = fixture.files.find((file) => file.path === "LICENSE.md");
	const manifestFile = fixture.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!design || !license || !manifestFile) {
		throw new Error("Foundation test source is incomplete");
	}
	design.content = `# Controlled Premium Delivery Fixture\n\n${design.content}`;
	license.content =
		"# Commercial Pack License\n\nUse is limited to the Project License issued during Installation.\n";

	const manifest = JSON.parse(manifestFile.content) as PackManifest & {
		preview: { summary: string; route: string };
	};
	manifest.id = "delivery-fixture";
	manifest.name = "Delivery Fixture";
	manifest.access = "premium";
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution: "Controlled premium delivery fixture by AgentKogei.",
	};
	manifest.preview = {
		...manifest.preview,
		summary: "Controlled non-catalog fixture for premium delivery.",
		route: "/pricing",
	};
	manifest.changelog.summary = "Initial controlled premium delivery fixture.";
	manifest.provenance = manifest.provenance.map((entry) => ({
		...entry,
		license: "LicenseRef-AgentKogei-Commercial",
		attribution: "Controlled premium delivery fixture by AgentKogei.",
	}));
	for (const declared of manifest.files) {
		declared.target = declared.target.replace(
			".agentkogei/foundation/",
			".agentkogei/delivery-fixture/",
		);
		const transported = fixture.files.find(
			(file) => file.path === declared.path,
		);
		if (!transported) throw new Error(`Missing ${declared.path}`);
		declared.sha256 = sha256(transported.content);
	}
	manifestFile.content = JSON.stringify(manifest, null, 2);
	return JSON.stringify(fixture);
}

/**
 * One synthetic protected Pack Release for an Official Catalog Premium Design
 * Pack. Both Premium identities are described the same way so a journey can
 * hold each to the same Design Contract and delivery behavior.
 */
type PremiumPackSpec = {
	identity: "command" | "signal";
	name: string;
	description: string;
	publishedAt: string;
	summary: string;
	changelog: string;
	/** What this pack's original work consists of, for its attribution. */
	originalWork: string;
	/**
	 * The resources whose direction is this pack's own, in the order it presents
	 * them. Licensing, attribution, and agent-run evidence read the same for
	 * every Premium Design Pack, so the builder supplies those.
	 */
	resources: ReadonlyArray<{ path: string; content: string }>;
};

/**
 * The resources every Premium Pack Release closes with: one commercial Pack
 * License, the provenance of its original work, and the evidence its Pack
 * Evaluation rests on.
 */
function premiumPackClosingResources(spec: PremiumPackSpec) {
	return [
		{
			path: "LICENSE.md",
			content:
				"# AgentKogei Commercial Pack License\n\nThis synthetic test snapshot may be used only to verify protected Installation and Project License behavior.\n",
		},
		{
			path: "ATTRIBUTION.md",
			content: `# Attribution and provenance\n\nAll ${spec.name} ${spec.originalWork} are original AgentKogei work. The test release contains no third-party assets or remote resources. Human rights review passed.\n`,
		},
		{
			path: "evaluation/agent-runs.md",
			content: `# ${spec.name} agent validation\n\nFour independent generation runs covered marketing, authentication, onboarding, application surfaces, every required state, responsive layouts, dark mode, keyboard use, and reduced motion. Human review passed visual distinctiveness, WCAG 2.2 AA, provenance, and commercial-rights checks.\n`,
		},
	];
}

/**
 * Builds the protected registry payload the Official Catalog holds for one
 * Premium Design Pack. Every resource carries that pack's own direction, so a
 * delivered Design Contract proves the pack rather than its skeleton.
 */
function buildPremiumPackRelease(spec: PremiumPackSpec) {
	const source = foundationRegistryItem();
	const manifestSource = source.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	const evaluationReport = source.files.find(
		(file) => file.path === "evaluation/report.json",
	);
	if (!manifestSource || !evaluationReport) {
		throw new Error("Foundation test source is incomplete");
	}

	const report = JSON.parse(evaluationReport.content) as Record<
		string,
		unknown
	>;
	report.pack = spec.identity;
	report.agentGenerationRuns = 4;
	report.agentRunEvidence = "evaluation/agent-runs.md";
	const published = [
		...spec.resources,
		...premiumPackClosingResources(spec),
		{
			path: "evaluation/report.json",
			content: `${JSON.stringify(report, null, "\t")}\n`,
		},
	];
	if (published[0]?.path !== "DESIGN.md") {
		throw new Error(`${spec.identity} must publish DESIGN.md first`);
	}

	const attribution = `${spec.name} by AgentKogei.`;
	const manifest = JSON.parse(manifestSource.content) as PackManifest;
	manifest.id = spec.identity;
	manifest.name = spec.name;
	manifest.publisher = "AgentKogei";
	manifest.access = "premium";
	manifest.release.publishedAt = spec.publishedAt;
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution,
	};
	manifest.evaluation.agentGenerationRuns = 4;
	manifest.preview = {
		summary: spec.summary,
		surfaces: [
			"marketing",
			"authentication",
			"onboarding",
			"dashboard",
			"table",
			"form",
			"settings",
			"states",
		],
		route: `/catalog/${spec.identity}`,
	};
	manifest.changelog.summary = spec.changelog;
	manifest.provenance = [
		{
			paths: published.map((resource) => resource.path),
			origin: "original",
			author: "AgentKogei",
			license: "LicenseRef-AgentKogei-Commercial",
			attribution,
		},
	];
	manifest.files = published.map((resource) => ({
		path: resource.path,
		target: `.agentkogei/${spec.identity}/${resource.path}`,
		sha256: sha256(resource.content),
		mediaType: mediaTypeOf(resource.path),
		mode: "0644",
	}));

	return JSON.stringify({
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: spec.identity,
		type: "registry:item",
		title: `${spec.name} Premium Design Pack`,
		description: spec.description,
		files: [
			{
				path: "agentkogei.manifest.json",
				type: "registry:file",
				target: `.agentkogei/${spec.identity}/agentkogei.manifest.json`,
				content: JSON.stringify(manifest, null, 2),
			},
			...published.map((resource) => ({
				path: resource.path,
				type: "registry:file" as const,
				target: `.agentkogei/${spec.identity}/${resource.path}`,
				content: resource.content,
			})),
		],
	});
}

const commandRelease: PremiumPackSpec = {
	identity: "command",
	name: "Command",
	description:
		"Synthetic protected Command release used only at the premium delivery test boundary.",
	publishedAt: "2026-07-19",
	summary: "Dark-first, dense, and technical.",
	changelog: "Initial immutable Command Pack Release.",
	originalWork: "prose, tokens, patterns, and evaluation materials",
	resources: [
		{
			path: "DESIGN.md",
			content: `# Command Interface System

This is a synthetic test release, not the commercial Command Design Contract.

Command is dark-first, dense, and technical. It gives developer and operations products a calm surface that stays readable when it is full of data.

## Required surfaces and states

Carry the Interface System through marketing, authentication, onboarding, dashboard, tables, forms, settings, and loading, empty, error, success, disabled, focus, and destructive states. Follow the anatomy in \`components.md\` and the operational density in \`patterns/operations.md\`.

## Responsive behavior

Preserve hierarchy at mobile widths, keep every record reachable without page-level horizontal overflow at 320px and wider, and keep each target at least 24 by 24 CSS pixels.

## Motion and reduced motion

Motion reports progress and state change only. Under prefers-reduced-motion, remove transitions, looping indicators, and large transforms while preserving instant state feedback.

## Accessibility and agent validation

Meet WCAG 2.2 Level AA in light and dark schemes. Preserve visible focus, keyboard operation, non-color status cues, zoom reflow, and contrast. Before completing generated work, verify every required surface, state, viewport, color scheme, and reduced-motion mode against \`validation.md\`.
`,
		},
		{
			path: "tokens.css",
			content: `:root {
	--command-background: oklch(0.21 0.02 264);
	--command-surface: oklch(0.26 0.02 264);
	--command-foreground: oklch(0.96 0.01 264);
	--command-primary: oklch(0.72 0.16 195);
	--command-critical: oklch(0.64 0.21 25);
	--command-radius: 0.25rem;
	--command-duration-fast: 120ms;
}
.light {
	--command-background: oklch(0.98 0.01 264);
	--command-foreground: oklch(0.24 0.02 264);
}
@media (prefers-reduced-motion: reduce) {
	:root { --command-duration-fast: 0ms; }
}
`,
		},
		{
			path: "components.md",
			content: `# Command component and state recipes

- Buttons stay compact with high-contrast labels and a persistent focus outline; disabled remains legible and non-interactive.
- Tables carry real headings and row relationships, support keyboard row navigation, and reflow each row into a labelled record on narrow screens.
- Command palettes and menus restore focus on dismissal and announce the active item.
- Forms keep visible labels, help, error, and success text. Color reinforces a state but never carries it alone.
- Use semantic roles from \`tokens.css\`; never hard-code a raw color in a component.
- Loading, empty, error, success, disabled, focus, and destructive states each need text, shape, and color evidence.
`,
		},
		{
			path: "adapters/react-tailwind-shadcn/README.md",
			content: `# Command on React / Next.js, Tailwind CSS v4, and shadcn/ui

Implement Command in the MVP stack without taking component ownership away from the Project.

1. Map Command semantic tokens into the Project's existing Tailwind theme; preserve its semantic class names.
2. Compose existing shadcn/ui primitives with tight spacing, thin rules, and explicit focus rings before adding a custom component.
3. Keep dense data in real table semantics rather than styled containers.
4. Implement state transitions with CSS utilities the Project owns, and remove them under reduced motion.
5. Dependencies are guidance only. The Builder chooses commands; this direction supplies no hooks, executable files, remote assets, or package-manager actions.
`,
		},
		{
			path: "examples.md",
			content: `# Command cross-surface examples

- Marketing: lead with one operational outcome and one dominant action over a dark field.
- Authentication: contain the task in a single bounded panel with visible labels and no decoration.
- Onboarding: show numbered progress in text, and announce the active step.
- Dashboard and tables: pair a small set of summary metrics with dense, scannable records.
- Forms and settings: group by responsibility and reserve critical color for destructive confirmation.
`,
		},
		{
			path: "validation.md",
			content: `# Command validation

Evaluate marketing, authentication, onboarding, dashboard, table, form, settings, and all state surfaces at 1440x900, 390x844, and 320px reflow. Cover light, dark, reduced-motion, keyboard-only, forced-colors, and 200% zoom modes. Run structural checks, WCAG 2.2 Level AA automation, contrast checks, overflow checks, and four independent agent generations. Human review must confirm visual distinctiveness, semantic correctness, provenance, attribution, and commercial rights before publication.
`,
		},
		{
			path: "patterns/operations.md",
			content: `# Command operations patterns

Test-only guidance for dense tables, command palettes, logs, and monitoring states. Keep run status, severity, and timestamps readable without hover, and never encode severity in color alone.
`,
		},
		{
			path: "patterns/terminal.md",
			content: `# Command terminal patterns

Test-only anatomy for selectable output, status annotations, and keyboard workflows. Terminal output stays selectable text, annotations carry accessible names, and every shortcut has a visible equivalent.
`,
		},
	],
};

const signalRelease: PremiumPackSpec = {
	identity: "signal",
	name: "Signal",
	description:
		"Synthetic protected Signal release used only at the premium delivery test boundary.",
	publishedAt: "2026-07-20",
	summary: "Bold geometry, expressive color, and richer motion.",
	changelog: "Initial immutable Signal Pack Release.",
	originalWork:
		"prose, tokens, motion guidance, evaluation evidence, and graphic resources",
	resources: [
		{
			path: "DESIGN.md",
			content: `# Signal Interface System

This is a synthetic test release, not the commercial Signal Design Contract.

Signal uses bold geometry, expressive color, and richer motion to give AI and creative products visible momentum without sacrificing clarity.

## Required surfaces and states

Carry the Interface System through marketing, authentication, onboarding, dashboard, tables, forms, settings, and loading, empty, error, success, disabled, focus, and destructive states. Geometry supports hierarchy; it never replaces labels or status text. Follow \`patterns/graphic-composition.md\` when composing a field, and build the marketing hero from \`resources/orbit-field.svg\`.

## Responsive behavior

Recompose overlaps into a single readable flow below 640px, keep every target at least 24 by 24 CSS pixels, preserve document order, and prevent page-level horizontal overflow at 320px and wider.

## Motion and reduced motion

Use short spatial transitions to explain entry, progress, and relationships, as set out in \`patterns/motion.md\`. Under prefers-reduced-motion, remove looping, parallax, scale, and large transforms while preserving instant state feedback.

## Accessibility and agent validation

Meet WCAG 2.2 Level AA in light and dark schemes. Preserve visible focus, keyboard operation, text alternatives for meaningful graphics, non-color status cues, zoom reflow, and contrast. Before completing generated work, verify every required surface, state, viewport, color scheme, and reduced-motion mode against \`validation.md\`.
`,
		},
		{
			path: "tokens.css",
			content: `:root {
	--signal-background: oklch(0.96 0.16 94);
	--signal-foreground: oklch(0.19 0.05 290);
	--signal-primary: oklch(0.53 0.25 293);
	--signal-accent: oklch(0.67 0.25 9);
	--signal-radius: 0rem;
	--signal-duration-fast: 160ms;
	--signal-duration-expressive: 420ms;
}
.dark {
	--signal-background: oklch(0.38 0.23 293);
	--signal-foreground: oklch(0.97 0.03 78);
}
@media (prefers-reduced-motion: reduce) {
	:root { --signal-duration-fast: 0ms; --signal-duration-expressive: 0ms; }
}
`,
		},
		{
			path: "components.md",
			content: `# Signal component and state recipes

- Buttons use high-contrast slabs, visible labels, and a persistent focus outline; disabled state remains legible and non-interactive.
- Cards may offset one geometric layer behind content, but content order, hit targets, and focus indicators stay above decoration.
- Tables retain real headings and row relationships; on narrow screens, reflow each row into a labelled record rather than clipping columns.
- Forms keep visible labels, help, error, and success text. Color may reinforce a state but never carries it alone.
- Dialogs, menus, and notifications use shadcn/ui interaction semantics and restore focus when dismissed.
- Use semantic roles from \`tokens.css\`; never hard-code a raw color in a component.
- Loading, empty, error, success, disabled, focus, and destructive states each require text, shape, and color evidence.
`,
		},
		{
			path: "adapters/react-tailwind-shadcn/README.md",
			content: `# Signal on React / Next.js, Tailwind CSS v4, and shadcn/ui

Implement Signal in the MVP stack without taking component ownership away from the Project.

1. Map Signal semantic tokens into the existing Tailwind theme; preserve the Project's semantic class names.
2. Compose shadcn/ui primitives with squared geometry, heavy borders, offset layers, and explicit focus rings. Never hide labels or state behind decoration.
3. Keep meaningful graphics in the accessibility tree with their supplied titles; mark decorative geometry hidden.
4. Implement spatial transitions with CSS utilities owned by the Project. Under reduced motion, remove looping, parallax, scale, and large transforms.
5. Preserve DOM reading order through responsive recomposition and prevent page-level overflow at 320px.
6. Dependencies are guidance only. The Builder chooses commands; this direction supplies no hooks, executable files, remote assets, or package-manager actions.
`,
		},
		{
			path: "examples.md",
			content: `# Signal cross-surface examples

- Marketing: pair one oversized outcome with a geometric proof field and one dominant action.
- Authentication: contain the task in a high-contrast slab with visible labels and restrained decoration.
- Onboarding: show numbered progress using text and geometry; announce the active step.
- Dashboard and tables: combine bold summary metrics with calm, scannable records.
- Forms and settings: reserve expressive color for hierarchy and state feedback, not decoration around every control.
- Motion: explain entrance, progress, and spatial relationships; reduced motion reaches the same result immediately.
`,
		},
		{
			path: "validation.md",
			content: `# Signal validation

Evaluate marketing, authentication, onboarding, dashboard, table, form, settings, and all state surfaces at 1440x900, 390x844, and 320px reflow. Cover light, dark, reduced-motion, keyboard-only, forced-colors, and 200% zoom modes. Run structural checks, WCAG 2.2 Level AA automation, contrast checks, overflow checks, and four independent agent generations. Human review must confirm visual distinctiveness, semantic correctness, motion restraint, provenance, attribution, and commercial rights before publication.
`,
		},
		{
			path: "patterns/motion.md",
			content: `# Signal motion patterns

Use purposeful entrances, spatial transitions, and progress feedback. Remove non-essential transforms and looping animation when reduced motion is requested.
`,
		},
		{
			path: "patterns/graphic-composition.md",
			content: `# Signal graphic composition

Build bold hierarchy from circles, offset rectangles, heavy rules, and deliberate overlaps while preserving reading order and focus visibility.
`,
		},
		{
			path: "resources/orbit-field.svg",
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img"><title>Signal orbit field</title><circle cx="230" cy="55" r="42" fill="none" stroke="currentColor" stroke-width="20"/><rect x="28" y="92" width="116" height="56" fill="currentColor"/></svg>\n',
		},
		{
			path: "resources/momentum-grid.svg",
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img"><title>Signal momentum grid</title><path d="M20 145h45V95h45v20h45V65h45v25h45V30h55" fill="none" stroke="currentColor" stroke-width="16"/></svg>\n',
		},
	],
};

export function buildTestCommandPackRelease() {
	return buildPremiumPackRelease(commandRelease);
}

export function buildTestSignalPackRelease() {
	return buildPremiumPackRelease(signalRelease);
}

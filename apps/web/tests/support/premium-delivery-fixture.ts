import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

type RegistryFile = {
	path: string;
	type: "registry:file";
	target: string;
	content: string;
};

function sha256(contents: string) {
	return createHash("sha256").update(contents).digest("hex");
}

export function buildTestPremiumDeliveryFixture() {
	const source = JSON.parse(
		readFileSync(path.resolve("public/r/foundation/1.0.0.json"), "utf8"),
	) as {
		name: string;
		title: string;
		description: string;
		files: RegistryFile[];
	};
	const fixture = structuredClone(source);
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

	const manifest = JSON.parse(manifestFile.content) as {
		id: string;
		name: string;
		access: string;
		license: Record<string, string>;
		files: Array<{ path: string; target: string; sha256: string }>;
		provenance: Array<Record<string, unknown>>;
		preview: { summary: string; route: string };
		changelog: { summary: string };
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

export function buildTestCommandPackRelease() {
	const source = JSON.parse(
		readFileSync(path.resolve("public/r/foundation/1.0.0.json"), "utf8"),
	) as {
		name: string;
		title: string;
		description: string;
		files: RegistryFile[];
	};
	const release = structuredClone(source);
	release.name = "command";
	release.title = "Command Premium Design Pack";
	release.description =
		"Synthetic protected Command release used only at the premium delivery test boundary.";
	for (const file of release.files) {
		file.target = file.target.replace(
			".agentkogei/foundation/",
			".agentkogei/command/",
		);
	}

	const syntheticResources = [
		{
			path: "patterns/operations.md",
			content:
				"# Synthetic operations patterns\n\nTest-only guidance for dense tables, command palettes, logs, and monitoring states.\n",
		},
		{
			path: "patterns/terminal.md",
			content:
				"# Synthetic terminal patterns\n\nTest-only anatomy for selectable output, status annotations, and keyboard workflows.\n",
		},
	] as const;
	for (const resource of syntheticResources) {
		release.files.push({
			path: resource.path,
			type: "registry:file",
			target: `.agentkogei/command/${resource.path}`,
			content: resource.content,
		});
	}

	const design = release.files.find((file) => file.path === "DESIGN.md");
	const license = release.files.find((file) => file.path === "LICENSE.md");
	const report = release.files.find(
		(file) => file.path === "evaluation/report.json",
	);
	const manifestFile = release.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!design || !license || !report || !manifestFile) {
		throw new Error("Foundation test source is incomplete");
	}
	design.content = `# Command Interface System

This is a synthetic test release, not the commercial Command Design Contract.

## Direction

Use a dark-first, dense, technical interface across marketing, authentication, onboarding, dashboards, tables, forms, settings, and every loading, empty, error, success, disabled, and destructive state.

## Responsive and motion behavior

Preserve hierarchy at mobile widths, keep data reachable without page overflow, and replace non-essential motion when reduced motion is requested.

## Accessibility and agent guidance

Meet WCAG 2.2 Level AA, preserve visible focus and keyboard operation, and verify contrast and accessible names before finishing generated work.
`;
	license.content =
		"# AgentKogei Commercial Pack License\n\nThis synthetic test snapshot may be used only to verify protected Installation and Project License behavior.\n";
	const reportContents = JSON.parse(report.content) as Record<string, unknown>;
	reportContents.pack = "command";
	report.content = `${JSON.stringify(reportContents, null, "\t")}\n`;

	type Manifest = {
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
	const manifest = JSON.parse(manifestFile.content) as Manifest;
	manifest.id = "command";
	manifest.name = "Command";
	manifest.publisher = "AgentKogei";
	manifest.access = "premium";
	manifest.release.publishedAt = "2026-07-19";
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution: "Command by AgentKogei.",
	};
	manifest.evaluation.agentGenerationRuns = 4;
	manifest.preview = {
		summary: "Dark-first, dense, and technical.",
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
		route: "/catalog/command",
	};
	manifest.changelog.summary = "Initial immutable Command Pack Release.";
	manifest.provenance = [
		{
			paths: release.files
				.filter((file) => file.path !== "agentkogei.manifest.json")
				.map((file) => file.path),
			origin: "original",
			author: "AgentKogei",
			license: "LicenseRef-AgentKogei-Commercial",
			attribution: "Command by AgentKogei.",
		},
	];
	manifest.files = release.files
		.filter((file) => file.path !== "agentkogei.manifest.json")
		.map((file) => ({
			path: file.path,
			target: file.target,
			sha256: sha256(file.content),
			mediaType: file.path.endsWith(".json")
				? "application/json"
				: file.path.endsWith(".css")
					? "text/css"
					: file.path.endsWith(".svg")
						? "image/svg+xml"
						: "text/markdown",
			mode: "0644",
		}));
	manifestFile.target = ".agentkogei/command/agentkogei.manifest.json";
	manifestFile.content = JSON.stringify(manifest, null, 2);
	return JSON.stringify(release);
}

export function buildTestSignalPackRelease() {
	const release = JSON.parse(buildTestCommandPackRelease()) as {
		name: string;
		title: string;
		description: string;
		files: RegistryFile[];
	};
	release.name = "signal";
	release.title = "Signal Premium Design Pack";
	release.description =
		"Synthetic protected Signal release used only at the premium delivery test boundary.";
	release.files = release.files
		.filter((file) => !file.path.startsWith("patterns/"))
		.map((file) => ({
			...file,
			target: file.target.replace(
				".agentkogei/command/",
				".agentkogei/signal/",
			),
		}));

	const signalResources = [
		{
			path: "patterns/motion.md",
			content:
				"# Signal motion patterns\n\nUse purposeful entrances, spatial transitions, and progress feedback. Remove non-essential transforms and looping animation when reduced motion is requested.\n",
		},
		{
			path: "patterns/graphic-composition.md",
			content:
				"# Signal graphic composition\n\nBuild bold hierarchy from circles, offset rectangles, heavy rules, and deliberate overlaps while preserving reading order and focus visibility.\n",
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
		{
			path: "evaluation/agent-runs.md",
			content:
				"# Signal agent validation\n\nFour independent generation runs covered marketing, authentication, onboarding, application surfaces, every required state, responsive layouts, dark mode, keyboard use, and reduced motion. Human review passed visual distinctiveness, WCAG 2.2 AA, provenance, and commercial-rights checks.\n",
		},
	] as const;
	for (const resource of signalResources) {
		release.files.push({
			path: resource.path,
			type: "registry:file",
			target: `.agentkogei/signal/${resource.path}`,
			content: resource.content,
		});
	}

	const design = release.files.find((file) => file.path === "DESIGN.md");
	const tokens = release.files.find((file) => file.path === "tokens.css");
	const license = release.files.find((file) => file.path === "LICENSE.md");
	const attribution = release.files.find(
		(file) => file.path === "ATTRIBUTION.md",
	);
	const adapter = release.files.find(
		(file) => file.path === "adapters/react-tailwind-shadcn/README.md",
	);
	const components = release.files.find(
		(file) => file.path === "components.md",
	);
	const examples = release.files.find((file) => file.path === "examples.md");
	const validation = release.files.find(
		(file) => file.path === "validation.md",
	);
	const report = release.files.find(
		(file) => file.path === "evaluation/report.json",
	);
	const manifestFile = release.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (
		!design ||
		!tokens ||
		!license ||
		!attribution ||
		!adapter ||
		!components ||
		!examples ||
		!validation ||
		!report ||
		!manifestFile
	) {
		throw new Error("Signal test source is incomplete");
	}
	design.content = `# Signal Interface System

Signal uses bold geometry, expressive color, and richer motion to give AI and creative products visible momentum without sacrificing clarity.

## Required surfaces and states

Carry the Interface System through marketing, authentication, onboarding, dashboard, tables, forms, settings, and loading, empty, error, success, disabled, focus, and destructive states. Geometry supports hierarchy; it never replaces labels or status text.

## Responsive behavior

Recompose overlaps into a single readable flow below 640px, keep every target at least 24 by 24 CSS pixels, preserve document order, and prevent page-level horizontal overflow at 320px and wider.

## Motion and reduced motion

Use short spatial transitions to explain entry, progress, and relationships. Under prefers-reduced-motion, remove looping, parallax, scale, and large transforms while preserving instant state feedback.

## Accessibility and agent validation

Meet WCAG 2.2 Level AA in light and dark schemes. Preserve visible focus, keyboard operation, text alternatives for meaningful graphics, non-color status cues, zoom reflow, and contrast. Before completing generated work, verify every required surface, state, viewport, color scheme, and reduced-motion mode against the evaluation evidence.
`;
	tokens.content = `:root {
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
`;
	license.content =
		"# AgentKogei Commercial Pack License\n\nThis synthetic test snapshot may be used only to verify protected Installation and Project License behavior.\n";
	attribution.content =
		"# Attribution and provenance\n\nAll Signal prose, tokens, motion guidance, evaluation evidence, and graphic resources are original AgentKogei work. The test release contains no third-party assets or remote resources. Human rights review passed.\n";
	adapter.content = `# Signal React / Next.js Stack Adapter

Translate Signal into React or Next.js Projects using Tailwind CSS v4 and shadcn/ui without replacing the Project's component ownership.

1. Map Signal semantic tokens into the existing Tailwind theme; preserve the Project's semantic class names.
2. Compose shadcn/ui primitives with squared geometry, heavy borders, offset layers, and explicit focus rings. Never hide labels or state behind decoration.
3. Keep meaningful SVG resources in the accessibility tree with their supplied titles; mark decorative geometry hidden.
4. Implement spatial transitions with CSS utilities owned by the Project. Under reduced motion, remove looping, parallax, scale, and large transforms.
5. Preserve DOM reading order through responsive recomposition and prevent page-level overflow at 320px.
6. Dependencies are guidance only. The Builder chooses commands; this Stack Adapter supplies no hooks, executable files, remote assets, or package-manager actions.
`;
	components.content = `# Signal component and state recipes

- Buttons use high-contrast slabs, visible labels, and a persistent focus outline; disabled state remains legible and non-interactive.
- Cards may offset one geometric layer behind content, but content order, hit targets, and focus indicators stay above decoration.
- Tables retain real headings and row relationships; on narrow screens, reflow each row into a labelled record rather than clipping columns.
- Forms keep visible labels, help, error, and success text. Color may reinforce a state but never carries it alone.
- Dialogs, menus, and notifications use shadcn/ui interaction semantics and restore focus when dismissed.
- Loading, empty, error, success, disabled, focus, and destructive states each require text, shape, and color evidence.
`;
	examples.content = `# Signal cross-surface examples

- Marketing: pair one oversized outcome with a geometric proof field and one dominant action.
- Authentication: contain the task in a high-contrast slab with visible labels and restrained decoration.
- Onboarding: show numbered progress using text and geometry; announce the active step.
- Dashboard and tables: combine bold summary metrics with calm, scannable records.
- Forms and settings: reserve expressive color for hierarchy and state feedback, not decoration around every control.
- Motion: explain entrance, progress, and spatial relationships; reduced motion reaches the same result immediately.
`;
	validation.content = `# Signal validation

Evaluate marketing, authentication, onboarding, dashboard, table, form, settings, and all state surfaces at 1440x900, 390x844, and 320px reflow. Cover light, dark, reduced-motion, keyboard-only, forced-colors, and 200% zoom modes. Run structural checks, WCAG 2.2 Level AA automation, contrast checks, overflow checks, and four independent agent generations. Human review must confirm visual distinctiveness, semantic correctness, motion restraint, provenance, attribution, and commercial rights before publication.
`;
	const reportContents = JSON.parse(report.content) as Record<string, unknown>;
	reportContents.pack = "signal";
	reportContents.agentRunEvidence = "evaluation/agent-runs.md";
	report.content = `${JSON.stringify(reportContents, null, "\t")}\n`;

	type Manifest = {
		id: string;
		name: string;
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
			origin: "original";
			author: string;
			license: string;
			attribution: string;
		}>;
		evaluation: { agentGenerationRuns: number };
		preview: { summary: string; surfaces: string[]; route: string };
		changelog: { summary: string };
	};
	const manifest = JSON.parse(manifestFile.content) as Manifest;
	manifest.id = "signal";
	manifest.name = "Signal";
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution: "Signal by AgentKogei.",
	};
	manifest.evaluation.agentGenerationRuns = 4;
	manifest.preview = {
		summary: "Bold geometry, expressive color, and richer motion.",
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
		route: "/catalog/signal",
	};
	manifest.changelog.summary = "Initial immutable Signal Pack Release.";
	manifest.provenance = [
		{
			paths: release.files
				.filter((file) => file.path !== "agentkogei.manifest.json")
				.map((file) => file.path),
			origin: "original",
			author: "AgentKogei",
			license: "LicenseRef-AgentKogei-Commercial",
			attribution: "Signal by AgentKogei.",
		},
	];
	manifest.files = release.files
		.filter((file) => file.path !== "agentkogei.manifest.json")
		.map((file) => ({
			path: file.path,
			target: file.target,
			sha256: sha256(file.content),
			mediaType: file.path.endsWith(".json")
				? "application/json"
				: file.path.endsWith(".css")
					? "text/css"
					: file.path.endsWith(".svg")
						? "image/svg+xml"
						: "text/markdown",
			mode: "0644",
		}));
	manifestFile.content = JSON.stringify(manifest, null, 2);
	return JSON.stringify(release);
}

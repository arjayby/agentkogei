/**
 * One synthetic protected Pack Release for an Official Catalog Premium Design
 * Pack. Both Premium identities are described the same way so a journey can
 * hold each to the same Design Contract and delivery behavior. Nothing here is
 * commercial content: every byte is written for the test boundary.
 */
type PremiumPackSpec = {
	identity: "command" | "signal";
	name: string;
	publishedAt: string;
	/** What this pack's original work consists of, for its attribution. */
	originalWork: string;
	/**
	 * The Design Contract's direction, in the order the pack presents it. Each
	 * entry is one `##` section of the single document a Project installs.
	 */
	sections: ReadonlyArray<{ title: string; body: string }>;
};

const premiumPackLicense =
	"AgentKogei Commercial Pack License (LicenseRef-AgentKogei-Commercial)";

/**
 * The provenance every Premium Design Contract closes with. A Project receives
 * this document and nothing else, so its licensing and attribution have to read
 * from the document itself.
 */
function provenanceSection(spec: PremiumPackSpec) {
	const attribution = `${spec.name} by AgentKogei.`;
	return [
		"---",
		"",
		"## Provenance",
		"",
		`- Design Pack: ${spec.name} (\`${spec.identity}\`)`,
		`- Pack Release: 1.0.0, published ${spec.publishedAt} by AgentKogei`,
		`- Pack License: ${premiumPackLicense}, https://agentkogei.com/docs/premium-pack-license`,
		`- Attribution: ${attribution}`,
		`- All ${spec.name} ${spec.originalWork} are original AgentKogei work; this test release contains no third-party assets or remote resources.`,
		"- Delivered by the AgentKogei Official Catalog as a single Design Contract.",
	].join("\n");
}

/**
 * Serializes one Premium Design Contract exactly as the Official Catalog holds
 * it: raw Markdown plus the catalog facts delivery sends as response headers.
 */
function buildPremiumDesignContract(spec: PremiumPackSpec) {
	const markdown = `${[
		`# ${spec.name} Interface System`,
		"",
		`This is a synthetic test release, not the commercial ${spec.name} Design Contract.`,
		"",
		...spec.sections.map((section) => `## ${section.title}\n\n${section.body}`),
		provenanceSection(spec),
	].join("\n\n")}\n`;

	return JSON.stringify({
		identity: spec.identity,
		designPack: spec.name,
		packRelease: "1.0.0",
		packLicense: premiumPackLicense,
		access: "premium",
		markdown,
	});
}

const commandRelease: PremiumPackSpec = {
	identity: "command",
	name: "Command",
	publishedAt: "2026-07-19",
	originalWork: "prose, tokens, patterns, and evaluation materials",
	sections: [
		{
			title: "Command principles",
			body: "Command is dark-first, dense, and technical. It gives developer and operations products a calm surface that stays readable when it is full of data.",
		},
		{
			title: "Token definitions",
			body: `\`\`\`css
:root {
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
\`\`\``,
		},
		{
			title: "Command component and state recipes",
			body: `- Buttons stay compact with high-contrast labels and a persistent focus outline; disabled remains legible and non-interactive.
- Tables carry real headings and row relationships, support keyboard row navigation, and reflow each row into a labelled record on narrow screens.
- Command palettes and menus restore focus on dismissal and announce the active item.
- Forms keep visible labels, help, error, and success text. Color reinforces a state but never carries it alone.
- Use semantic roles from the Token definitions section; never hard-code a raw color in a component.
- Loading, empty, error, success, disabled, focus, and destructive states each need text, shape, and color evidence.`,
		},
		{
			title: "Command operations patterns",
			body: "Test-only guidance for dense tables, command palettes, logs, and monitoring states. Keep run status, severity, and timestamps readable without hover, and never encode severity in color alone.",
		},
		{
			title: "Command terminal patterns",
			body: "Test-only anatomy for selectable output, status annotations, and keyboard workflows. Terminal output stays selectable text, annotations carry accessible names, and every shortcut has a visible equivalent.",
		},
		{
			title: "Command on React / Next.js, Tailwind CSS v4, and shadcn/ui",
			body: `Implement Command in the MVP stack without taking component ownership away from the Project.

1. Map Command semantic tokens into the Project's existing Tailwind theme; preserve its semantic class names.
2. Compose existing shadcn/ui primitives with tight spacing, thin rules, and explicit focus rings before adding a custom component.
3. Keep dense data in real table semantics rather than styled containers.
4. Implement state transitions with CSS utilities the Project owns, and remove them under reduced motion.
5. Dependencies are guidance only. The Builder chooses commands; this direction supplies no hooks, executable files, remote assets, or package-manager actions.`,
		},
		{
			title: "Required surfaces, responsiveness, and motion",
			body: `Carry the Interface System through marketing, authentication, onboarding, dashboard, tables, forms, settings, and loading, empty, error, success, disabled, focus, and destructive states.

Preserve hierarchy at mobile widths, keep every record reachable without page-level horizontal overflow at 320px and wider, and keep each target at least 24 by 24 CSS pixels.

Motion reports progress and state change only. Under prefers-reduced-motion, remove transitions, looping indicators, and large transforms while preserving instant state feedback.`,
		},
		{
			title: "Command validation",
			body: "Evaluate marketing, authentication, onboarding, dashboard, table, form, settings, and all state surfaces at 1440x900, 390x844, and 320px reflow. Cover light, dark, reduced-motion, keyboard-only, forced-colors, and 200% zoom modes. Run structural checks, WCAG 2.2 Level AA automation, contrast checks, overflow checks, and four independent agent generations. Human review must confirm visual distinctiveness, semantic correctness, provenance, attribution, and commercial rights before publication.",
		},
	],
};

const signalRelease: PremiumPackSpec = {
	identity: "signal",
	name: "Signal",
	publishedAt: "2026-07-20",
	originalWork:
		"prose, tokens, motion guidance, evaluation evidence, and graphic resources",
	sections: [
		{
			title: "Signal principles",
			body: "Signal uses bold geometry, expressive color, and richer motion to give AI and creative products visible momentum without sacrificing clarity.",
		},
		{
			title: "Token definitions",
			body: `\`\`\`css
:root {
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
\`\`\``,
		},
		{
			title: "Signal component and state recipes",
			body: `- Buttons use high-contrast slabs, visible labels, and a persistent focus outline; disabled state remains legible and non-interactive.
- Cards may offset one geometric layer behind content, but content order, hit targets, and focus indicators stay above decoration.
- Tables retain real headings and row relationships; on narrow screens, reflow each row into a labelled record rather than clipping columns.
- Forms keep visible labels, help, error, and success text. Color may reinforce a state but never carries it alone.
- Dialogs, menus, and notifications use shadcn/ui interaction semantics and restore focus when dismissed.
- Use semantic roles from the Token definitions section; never hard-code a raw color in a component.
- Loading, empty, error, success, disabled, focus, and destructive states each require text, shape, and color evidence.`,
		},
		{
			title: "Signal motion patterns",
			body: "Use purposeful entrances, spatial transitions, and progress feedback. Remove non-essential transforms and looping animation when reduced motion is requested.",
		},
		{
			title: "Signal graphic composition",
			body: "Build bold hierarchy from circles, offset rectangles, heavy rules, and deliberate overlaps while preserving reading order and focus visibility. Compose the marketing hero from the Signal orbit field section.",
		},
		{
			title: "Signal orbit field",
			body: `\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img"><title>Signal orbit field</title><circle cx="230" cy="55" r="42" fill="none" stroke="currentColor" stroke-width="20"/><rect x="28" y="92" width="116" height="56" fill="currentColor"/></svg>
\`\`\``,
		},
		{
			title: "Signal momentum grid",
			body: `\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img"><title>Signal momentum grid</title><path d="M20 145h45V95h45v20h45V65h45v25h45V30h55" fill="none" stroke="currentColor" stroke-width="16"/></svg>
\`\`\``,
		},
		{
			title: "Signal on React / Next.js, Tailwind CSS v4, and shadcn/ui",
			body: `Implement Signal in the MVP stack without taking component ownership away from the Project.

1. Map Signal semantic tokens into the existing Tailwind theme; preserve the Project's semantic class names.
2. Compose shadcn/ui primitives with squared geometry, heavy borders, offset layers, and explicit focus rings. Never hide labels or state behind decoration.
3. Keep meaningful graphics in the accessibility tree with their supplied titles; mark decorative geometry hidden.
4. Implement spatial transitions with CSS utilities owned by the Project. Under reduced motion, remove looping, parallax, scale, and large transforms.
5. Preserve DOM reading order through responsive recomposition and prevent page-level overflow at 320px.
6. Dependencies are guidance only. The Builder chooses commands; this direction supplies no hooks, executable files, remote assets, or package-manager actions.`,
		},
		{
			title: "Required surfaces, responsiveness, and motion",
			body: `Carry the Interface System through marketing, authentication, onboarding, dashboard, tables, forms, settings, and loading, empty, error, success, disabled, focus, and destructive states. Geometry supports hierarchy; it never replaces labels or status text.

Recompose overlaps into a single readable flow below 640px, keep every target at least 24 by 24 CSS pixels, preserve document order, and prevent page-level horizontal overflow at 320px and wider.

Use short spatial transitions to explain entry, progress, and relationships. Under prefers-reduced-motion, remove looping, parallax, scale, and large transforms while preserving instant state feedback.`,
		},
		{
			title: "Signal validation",
			body: "Evaluate marketing, authentication, onboarding, dashboard, table, form, settings, and all state surfaces at 1440x900, 390x844, and 320px reflow. Cover light, dark, reduced-motion, keyboard-only, forced-colors, and 200% zoom modes. Run structural checks, WCAG 2.2 Level AA automation, contrast checks, overflow checks, and four independent agent generations. Human review must confirm visual distinctiveness, semantic correctness, motion restraint, provenance, attribution, and commercial rights before publication.",
		},
	],
};

export function buildTestCommandPackRelease() {
	return buildPremiumDesignContract(commandRelease);
}

export function buildTestSignalPackRelease() {
	return buildPremiumDesignContract(signalRelease);
}

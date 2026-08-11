import type { ReactNode } from "react";

import type { DesignSystem, PreviewPalette } from "@/lib/catalog";

const fontFamilies = {
	sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
	serif: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
	mono: "var(--font-geist-mono), ui-monospace, monospace",
} as const;

const spacing = {
	compact: "1rem",
	balanced: "1.25rem",
	spacious: "1.75rem",
} as const;

const radii = {
	square: "0",
	soft: "0.375rem",
	rounded: "0.875rem",
	pill: "9999px",
} as const;

const borderWidths = {
	subtle: "1px",
	defined: "2px",
	strong: "3px",
} as const;

const shadows = {
	flat: "none",
	layered:
		"0 1rem 2.5rem color-mix(in oklab, var(--preview-foreground) 14%, transparent)",
} as const;

function paletteDeclarations(palette: PreviewPalette) {
	return Object.entries(palette)
		.map(([name, value]) => {
			const cssName = name.replace(
				/[A-Z]/g,
				(letter) => `-${letter.toLowerCase()}`,
			);
			return `--preview-${cssName}: ${value};`;
		})
		.join("\n");
}

export function DesignSystemPreviewTheme({
	designSystem,
	children,
}: {
	designSystem: DesignSystem;
	children: ReactNode;
}) {
	const { geometry, tokens, typography } = designSystem.preview;
	const selector = `[data-design-system-preview="${designSystem.slug}"]`;
	const sharedDeclarations = `
		--preview-font-display: ${fontFamilies[typography.display]};
		--preview-font-body: ${fontFamilies[typography.body]};
		--preview-font-accent: ${fontFamilies[typography.accent]};
		--preview-space: ${spacing[geometry.density]};
		--preview-radius: ${radii[geometry.radius]};
		--preview-border-width: ${borderWidths[geometry.border]};
		--preview-shadow: ${shadows[geometry.elevation]};
	`;

	return (
		<>
			<style>{`${selector} {
				${paletteDeclarations(tokens.light)}
				${sharedDeclarations}
			}
			.dark ${selector} {
				${paletteDeclarations(tokens.dark)}
			}`}</style>
			<div data-design-system-preview={designSystem.slug}>{children}</div>
		</>
	);
}

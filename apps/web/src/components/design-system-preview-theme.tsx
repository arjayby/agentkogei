import type { ReactNode } from "react";

import {
	type DesignSystem,
	type DesignSystemDiscovery,
	type PreviewPalette,
	previewShellFor,
} from "@/lib/catalog";

const fontFamilies = {
	"geometric-sans":
		"var(--font-geist-sans), Avenir Next, ui-sans-serif, system-ui, sans-serif",
	"humanist-sans": "Avenir, Segoe UI, ui-sans-serif, system-ui, sans-serif",
	"editorial-serif": "Iowan Old Style, Georgia, Cambria, ui-serif, serif",
	"neo-grotesk": "Helvetica Neue, Arial, ui-sans-serif, sans-serif",
	"technical-mono":
		"var(--font-geist-mono), SFMono-Regular, Consolas, ui-monospace, monospace",
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

function resolvedPreviewShell(
	designSystem: DesignSystem | DesignSystemDiscovery,
) {
	return "releases" in designSystem
		? previewShellFor(designSystem)
		: designSystem.previewShell;
}

function previewThemeStylesheet(
	designSystem: DesignSystem | DesignSystemDiscovery,
	page: boolean,
) {
	const { theme, typography } = resolvedPreviewShell(designSystem);
	const { geometry, tokens } = theme;
	const selector = `[data-design-system-preview="${designSystem.slug}"]`;
	const pageSelector = `body:has([data-design-system-preview-page="${designSystem.slug}"])`;
	const scope = page ? `${selector}, ${pageSelector}` : selector;
	const darkScope = page
		? `.dark ${selector}, .dark ${pageSelector}`
		: `.dark ${selector}`;
	const preferredDarkScope = page
		? `html:not(.light) ${selector}, html:not(.light) ${pageSelector}`
		: `html:not(.light) ${selector}`;
	const sharedDeclarations = `
		--preview-font-display: ${fontFamilies[typography.display]};
		--preview-font-body: ${fontFamilies[typography.body]};
		--preview-font-accent: ${fontFamilies[typography.accent]};
		--preview-space: ${spacing[geometry.density]};
		--preview-radius: ${radii[geometry.radius]};
		--preview-border-width: ${borderWidths[geometry.border]};
		--preview-shadow: ${shadows[geometry.elevation]};
	`;
	const semanticDeclarations = `
		--background: var(--preview-background);
		--foreground: var(--preview-foreground);
		--card: var(--preview-card);
		--card-foreground: var(--preview-foreground);
		--popover: var(--preview-card);
		--popover-foreground: var(--preview-foreground);
		--primary: var(--preview-primary);
		--primary-foreground: var(--preview-primary-foreground);
		--secondary: var(--preview-muted);
		--secondary-foreground: var(--preview-foreground);
		--muted: var(--preview-muted);
		--muted-foreground: var(--preview-muted-foreground);
		--accent: var(--preview-muted);
		--accent-foreground: var(--preview-foreground);
		--destructive: var(--preview-destructive);
		--border: var(--preview-border);
		--input: var(--preview-border);
		--ring: var(--preview-ring);
		--color-background: var(--preview-background);
		--color-foreground: var(--preview-foreground);
		--color-card: var(--preview-card);
		--color-card-foreground: var(--preview-foreground);
		--color-popover: var(--preview-card);
		--color-popover-foreground: var(--preview-foreground);
		--color-primary: var(--preview-primary);
		--color-primary-foreground: var(--preview-primary-foreground);
		--color-secondary: var(--preview-muted);
		--color-secondary-foreground: var(--preview-foreground);
		--color-muted: var(--preview-muted);
		--color-muted-foreground: var(--preview-muted-foreground);
		--color-accent: var(--preview-muted);
		--color-accent-foreground: var(--preview-foreground);
		--color-destructive: var(--preview-destructive);
		--color-border: var(--preview-border);
		--color-input: var(--preview-border);
		--color-ring: var(--preview-ring);
	`;

	return `${scope} {
		${paletteDeclarations(tokens.light)}
		${sharedDeclarations}
		${semanticDeclarations}
	}
	${darkScope} {
		${paletteDeclarations(tokens.dark)}
	}
	@media (prefers-color-scheme: dark) {
		${preferredDarkScope} {
			${paletteDeclarations(tokens.dark)}
		}
	}
	${
		page
			? `${pageSelector} {
		background: var(--preview-background);
		color: var(--preview-foreground);
		font-family: var(--preview-font-body);
	}
	${pageSelector} .site-header,
	${pageSelector} main,
	${pageSelector} footer {
		background: var(--preview-background);
		color: var(--preview-foreground);
	}
	${pageSelector} h1,
	${pageSelector} h2,
	${pageSelector} h3 {
		font-family: var(--preview-font-display);
	}
	${pageSelector} .site-brand,
	${pageSelector} nav,
	${pageSelector} footer {
		font-family: var(--preview-font-accent);
	}`
			: ""
	}`;
}

export function DesignSystemPreviewTheme({
	designSystem,
	children,
	page = false,
	includeStyles = true,
}: {
	designSystem: DesignSystem | DesignSystemDiscovery;
	children: ReactNode;
	page?: boolean;
	includeStyles?: boolean;
}) {
	const { composition } = resolvedPreviewShell(designSystem);
	const stylesheet = previewThemeStylesheet(designSystem, page);

	if (page) {
		return (
			<>
				{includeStyles ? <style>{stylesheet}</style> : null}
				<main
					data-design-system-preview={designSystem.slug}
					data-design-system-preview-page={designSystem.slug}
					data-preview-composition={composition}
				>
					{children}
				</main>
			</>
		);
	}

	return (
		<>
			{includeStyles ? <style>{stylesheet}</style> : null}
			<div data-design-system-preview={designSystem.slug}>{children}</div>
		</>
	);
}

export function DesignSystemPreviewThemeStyles({
	designSystem,
}: {
	designSystem: DesignSystem | DesignSystemDiscovery;
}) {
	return <style>{previewThemeStylesheet(designSystem, false)}</style>;
}

import type { CSSProperties } from "react";

import {
	catalogMetadataLabel,
	type DesignSystem,
	previewShellFor,
} from "@/lib/catalog";

function entries<T extends Record<string, unknown>>(record: T) {
	return Object.entries(record) as Array<
		{ [Key in keyof T]: [Key, T[Key]] }[keyof T]
	>;
}

function metadataLabel(value: string) {
	return catalogMetadataLabel(value.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

const typographySamples: Record<string, string> = {
	display: "A distinct point of view.",
	heading: "Visual foundations",
	"page-title": "Current workspace",
	"section-title": "Release activity",
	body: "Clear hierarchy makes complex product work easier to understand.",
	label: "EVALUATED DIRECTION",
	"compact-interface": "Filter results",
	telemetry: "RUN 042 · 98% HEALTHY",
	eyebrow: "OPERATIONAL CONTEXT",
	code: "npx agentkogei@latest add",
};

function responsiveFontSize(size: { mobile: number; desktop: number }) {
	const viewportRangeRem = 70;
	const mobileViewportRem = 20;
	const difference = size.desktop - size.mobile;
	const offset =
		size.mobile - (difference * mobileViewportRem) / viewportRangeRem;
	const viewportCoefficient = (difference * 100) / viewportRangeRem;
	const concise = (value: number) => Number(value.toFixed(6));

	return `clamp(${size.mobile}rem, calc(${concise(offset)}rem + ${concise(viewportCoefficient)}vw), ${size.desktop}rem)`;
}

export function DesignSystemFoundationsSpecimen({
	designSystem,
}: {
	designSystem: DesignSystem;
}) {
	const { composition, foundations, theme } = previewShellFor(designSystem);
	if (!foundations) return null;

	const { semanticColorUsage, typographyScale, spacingScale, layout } =
		foundations;
	const responsiveModes = [
		[
			"mobile",
			`${foundations.responsive.mobile.minWidthPx}px and wider`,
			foundations.responsive.mobile.guidance,
		],
		[
			"tablet",
			`${foundations.responsive.tablet.minWidthPx}px and wider`,
			foundations.responsive.tablet.guidance,
		],
		[
			"desktop",
			`${foundations.responsive.desktop.minWidthPx}px and wider`,
			foundations.responsive.desktop.guidance,
		],
		[
			"zoom",
			`${foundations.responsive.zoom.scalePercent}% zoom`,
			foundations.responsive.zoom.guidance,
		],
		[
			"reflow",
			`${foundations.responsive.reflow.widthPx}px reflow`,
			foundations.responsive.reflow.guidance,
		],
	] as const;

	return (
		<section
			aria-label={`${designSystem.name} visual foundations`}
			data-foundations-composition={composition}
			className="preview-foundations-grid"
		>
			<section
				data-foundation-section="principles"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>01 / Principles</p>
					<h3>Principles and signature</h3>
				</div>
				<p className="catalog-preview-display text-3xl leading-tight sm:text-5xl">
					{designSystem.preview.signature.label}
				</p>
				<ol className="grid gap-px bg-[var(--preview-border)] sm:grid-cols-3">
					{designSystem.preview.signature.principles.map((principle, index) => (
						<li
							key={principle}
							className="bg-[var(--preview-card)] p-4 text-sm leading-6"
						>
							<span className="catalog-preview-accent catalog-preview-muted mr-3 text-xs">
								{String(index + 1).padStart(2, "0")}
							</span>
							{principle}
						</li>
					))}
				</ol>
			</section>

			<section
				data-foundation-section="semantic-colors"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>02 / Semantic colors</p>
					<h3>Light and dark roles</h3>
				</div>
				<div className="grid gap-6 xl:grid-cols-2">
					{entries(theme.tokens).map(([scheme, palette]) => (
						<section
							key={scheme}
							aria-label={`${metadataLabel(scheme)} semantic colors`}
							className="min-w-0"
						>
							<h4 className="catalog-preview-accent mb-3 text-sm uppercase tracking-[0.12em]">
								{metadataLabel(scheme)}
							</h4>
							<ul className="grid gap-px bg-[var(--preview-border)]">
								{entries(palette).map(([name, value]) => (
									<li
										key={name}
										className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-3 bg-[var(--preview-card)] p-3"
									>
										<span
											aria-hidden="true"
											className="size-11 border border-[var(--preview-border)]"
											style={{ backgroundColor: value }}
										/>
										<dl className="min-w-0">
											<dt className="font-medium text-sm">
												{metadataLabel(name)}
											</dt>
											<dd className="grid gap-1">
												<code className="break-all text-xs">{value}</code>
												<span className="catalog-preview-muted text-xs leading-5">
													{semanticColorUsage[name]}
												</span>
											</dd>
										</dl>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			</section>

			<section
				data-foundation-section="typography"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>03 / Typography</p>
					<h3>Role based type scale</h3>
				</div>
				<div className="grid gap-px bg-[var(--preview-border)]">
					{entries(typographyScale).map(([role, specimen]) => {
						const style = {
							fontFamily: `var(--preview-font-${specimen.font})`,
							fontSize: responsiveFontSize(specimen.sizeRem),
							fontWeight: specimen.weight,
							lineHeight: specimen.lineHeight,
							letterSpacing: `${specimen.trackingEm}em`,
						} satisfies CSSProperties;

						return (
							<article
								key={role}
								data-type-role={role}
								data-mobile-size-rem={specimen.sizeRem.mobile}
								data-desktop-size-rem={specimen.sizeRem.desktop}
								className="grid min-w-0 gap-5 bg-[var(--preview-card)] p-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end"
							>
								<p className="overflow-wrap-anywhere min-w-0" style={style}>
									{typographySamples[role] ?? metadataLabel(role)}
								</p>
								<div className="grid gap-1 text-xs leading-5">
									<h4 className="font-medium text-sm">{metadataLabel(role)}</h4>
									<p className="catalog-preview-muted">
										{specimen.sizeRem.mobile}rem to {specimen.sizeRem.desktop}
										rem · {specimen.weight} · {specimen.lineHeight} line height
										· {specimen.trackingEm}em tracking
									</p>
									<p>{specimen.usage}</p>
								</div>
							</article>
						);
					})}
				</div>
			</section>

			<section
				data-foundation-section="spacing"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>04 / Spacing</p>
					<h3>Spacing scale</h3>
				</div>
				<ul className="grid gap-3">
					{entries(spacingScale).map(([name, step]) => (
						<li
							key={name}
							data-spacing-step={name}
							className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-center gap-4"
						>
							<span className="catalog-preview-accent text-xs">{name}</span>
							<div className="grid min-w-0 gap-2">
								<span
									aria-hidden="true"
									className="block h-3 max-w-full bg-[var(--preview-primary)]"
									style={{
										width: `min(100%, ${Math.max(step.valueRem * 5, 0.25)}rem)`,
									}}
								/>
								<p className="text-xs leading-5">
									{step.valueRem}rem · {step.usage}
								</p>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section
				data-foundation-section="layout-responsive"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>05 / Layout and responsive behavior</p>
					<h3>Constraints that preserve hierarchy</h3>
				</div>
				<div className="catalog-preview-panel grid gap-5 border p-4">
					<div
						aria-hidden="true"
						className="grid h-24 gap-1"
						style={{
							gridTemplateColumns: `repeat(${layout.columns.desktop}, minmax(0, 1fr))`,
						}}
					>
						{Array.from({ length: layout.columns.desktop }, (_, index) => (
							<span key={index} className="bg-[var(--preview-muted)]" />
						))}
					</div>
					<p className="text-sm leading-6">{layout.guidance}</p>
					<p className="catalog-preview-muted text-xs leading-5">
						Maximum {layout.maxWidthRem}rem · Reading width{" "}
						{layout.contentWidthCh}
						ch · Columns {layout.columns.mobile}/{layout.columns.tablet}/
						{layout.columns.desktop} · Gutters {layout.gutterRem.mobile}/
						{layout.gutterRem.tablet}/{layout.gutterRem.desktop}rem
					</p>
				</div>
				<ul className="grid gap-px bg-[var(--preview-border)] sm:grid-cols-2 xl:grid-cols-5">
					{responsiveModes.map(([mode, measure, guidance]) => (
						<li
							key={mode}
							data-responsive-mode={mode}
							className="grid content-start gap-2 bg-[var(--preview-card)] p-4"
						>
							<h4 className="font-medium text-sm">{metadataLabel(mode)}</h4>
							<p className="catalog-preview-accent catalog-preview-muted text-xs">
								{measure}
							</p>
							<p className="text-xs leading-5">{guidance}</p>
						</li>
					))}
				</ul>
			</section>

			<section
				data-foundation-section="radius-borders-elevation"
				className="preview-foundation-section"
			>
				<div className="preview-foundation-heading">
					<p>06 / Radius, borders, and elevation</p>
					<h3>Surface geometry and depth</h3>
				</div>
				<div className="grid gap-6 lg:grid-cols-3">
					<div>
						<h4 className="catalog-preview-accent mb-3 text-sm uppercase tracking-[0.12em]">
							Radius
						</h4>
						<ul className="grid gap-3">
							{entries(foundations.geometry.radii).map(([name, specimen]) => (
								<li
									key={name}
									data-radius-specimen={name}
									className="grid gap-2"
								>
									<span
										aria-hidden="true"
										className="block h-16 border border-[var(--preview-border)] bg-[var(--preview-muted)]"
										style={{ borderRadius: `${specimen.valueRem}rem` }}
									/>
									<p className="text-xs leading-5">
										<strong>{metadataLabel(name)}</strong> · {specimen.valueRem}
										rem · {specimen.usage}
									</p>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="catalog-preview-accent mb-3 text-sm uppercase tracking-[0.12em]">
							Borders
						</h4>
						<ul className="grid gap-3">
							{entries(foundations.geometry.borders).map(([name, specimen]) => (
								<li
									key={name}
									data-border-specimen={name}
									className="grid gap-2"
								>
									<span
										aria-hidden="true"
										className="block h-16 bg-[var(--preview-card)]"
										style={{
											borderColor: "var(--preview-border)",
											borderStyle: specimen.style,
											borderWidth: specimen.widthPx,
										}}
									/>
									<p className="text-xs leading-5">
										<strong>{metadataLabel(name)}</strong> · {specimen.widthPx}
										px · {specimen.usage}
									</p>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="catalog-preview-accent mb-3 text-sm uppercase tracking-[0.12em]">
							Elevation
						</h4>
						<ul className="grid gap-3">
							{entries(foundations.geometry.elevation).map(
								([name, specimen]) => (
									<li
										key={name}
										data-elevation-specimen={name}
										className="grid gap-2"
									>
										<span
											aria-hidden="true"
											className="m-2 block h-14 border border-[var(--preview-border)] bg-[var(--preview-card)]"
											style={{
												boxShadow:
													specimen.opacity === 0
														? "none"
														: `0 ${specimen.offsetYRem}rem ${specimen.blurRem}rem ${specimen.spreadRem}rem color-mix(in oklab, var(--preview-foreground) ${specimen.opacity * 100}%, transparent)`,
											}}
										/>
										<p className="text-xs leading-5">
											<strong>{metadataLabel(name)}</strong> · {specimen.usage}
										</p>
									</li>
								),
							)}
						</ul>
					</div>
				</div>
			</section>
		</section>
	);
}

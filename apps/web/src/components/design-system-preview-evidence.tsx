import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { DesignSystemPreviewTheme } from "@/components/design-system-preview-theme";
import { catalogMetadataLabel, type DesignSystem } from "@/lib/catalog";

type DesignSystemPreviewSurface = DesignSystem["preview"]["surfaces"][number];

const surfaceEvidence: Record<DesignSystemPreviewSurface, () => ReactNode> = {
	marketing: () => (
		<div className="grid gap-3">
			<p className="catalog-preview-display text-xl">
				A clear product outcome.
			</p>
			<p className="catalog-preview-muted text-xs">
				Concise proof and one primary action.
			</p>
			<span className="catalog-preview-primary w-fit rounded-[var(--preview-radius)] px-3 py-1 text-xs">
				Explore
			</span>
		</div>
	),
	authentication: () => (
		<div className="grid gap-2">
			<p className="text-xs">Work email</p>
			<span className="h-8 border border-[var(--preview-border)] bg-[var(--preview-background)]" />
			<span className="catalog-preview-primary h-8 rounded-[var(--preview-radius)]" />
		</div>
	),
	onboarding: () => (
		<div className="grid gap-3">
			<p className="catalog-preview-muted text-xs">Step 2 of 4</p>
			<div className="grid grid-cols-4 gap-1">
				<span className="h-1 bg-[var(--preview-primary)]" />
				<span className="h-1 bg-[var(--preview-primary)]" />
				<span className="h-1 bg-[var(--preview-border)]" />
				<span className="h-1 bg-[var(--preview-border)]" />
			</div>
			<p>Connect the supplied Project</p>
		</div>
	),
	dashboard: () => (
		<div className="grid grid-cols-2 gap-2">
			{["24 active", "98% healthy", "3 reviews", "7 releases"].map((metric) => (
				<span
					key={metric}
					className="border border-[var(--preview-border)] bg-[var(--preview-background)] p-2 text-xs"
				>
					{metric}
				</span>
			))}
		</div>
	),
	table: () => (
		<div className="grid gap-px bg-[var(--preview-border)] text-xs">
			{[
				"Release · Status · Date",
				"1.0.0 · Published · Jul 18",
				"0.9.0 · Archived · Jun 10",
			].map((row) => (
				<span key={row} className="bg-[var(--preview-background)] p-2">
					{row}
				</span>
			))}
		</div>
	),
	form: () => (
		<div className="grid gap-2 text-xs">
			<p>Visible field label</p>
			<span className="h-8 border border-[var(--preview-border)] bg-[var(--preview-background)]" />
			<p className="catalog-preview-muted">Persistent help and error area</p>
		</div>
	),
	settings: () => (
		<div className="grid gap-2 text-xs">
			{[
				"Notifications · On",
				"Appearance · System",
				"Delete Project · Review",
			].map((setting) => (
				<span
					key={setting}
					className="border-[var(--preview-border)] border-b pb-2 last:border-b-0"
				>
					{setting}
				</span>
			))}
		</div>
	),
	states: () => (
		<div className="grid grid-cols-2 gap-2 text-xs">
			{["Loading", "Empty", "Error", "Success"].map((state) => (
				<span
					key={state}
					className="border border-[var(--preview-border)] bg-[var(--preview-background)] p-2"
				>
					{state}
				</span>
			))}
		</div>
	),
};

export function DesignSystemPreviewEvidence({
	designSystem,
}: {
	designSystem: DesignSystem;
}) {
	const { signature, surfaces } = designSystem.preview;

	return (
		<DesignSystemPreviewTheme designSystem={designSystem}>
			<section
				className="grid gap-px border bg-border md:grid-cols-3"
				aria-label={`${designSystem.name} rendered Design System Preview`}
			>
				{surfaces.map((surface, index) => {
					const principle =
						signature.principles[index % signature.principles.length];
					const SurfaceEvidence = surfaceEvidence[surface];

					return (
						<article
							key={surface}
							className="catalog-preview-surface flex min-h-64 flex-col justify-between p-[var(--preview-space)]"
						>
							<div className="catalog-preview-accent catalog-preview-muted flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em]">
								<h3>{catalogMetadataLabel(surface)}</h3>
								<span>{String(index + 1).padStart(2, "0")}</span>
							</div>

							<div className="flex flex-col gap-4">
								<p className="catalog-preview-display max-w-xs font-medium text-2xl leading-tight">
									{principle}
								</p>
								<div className="catalog-preview-panel border p-3">
									<SurfaceEvidence />
								</div>
							</div>

							<div className="catalog-preview-accent catalog-preview-muted flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em]">
								<Check aria-hidden="true" className="size-3" />
								Evaluated evidence
							</div>
						</article>
					);
				})}
			</section>
		</DesignSystemPreviewTheme>
	);
}

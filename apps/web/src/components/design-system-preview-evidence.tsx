import { Check } from "lucide-react";

import { DesignSystemPreviewTheme } from "@/components/design-system-preview-theme";
import type { DesignSystem } from "@/lib/catalog";

function surfaceName(surface: string) {
	return `${surface.charAt(0).toUpperCase()}${surface.slice(1)}`;
}

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

					return (
						<article
							key={surface}
							className="catalog-preview-surface flex min-h-64 flex-col justify-between p-[var(--preview-space)]"
						>
							<div className="catalog-preview-accent catalog-preview-muted flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em]">
								<span>{surfaceName(surface)}</span>
								<span>{String(index + 1).padStart(2, "0")}</span>
							</div>

							<div className="flex flex-col gap-4">
								<p className="catalog-preview-display max-w-xs font-medium text-2xl leading-tight">
									{principle}
								</p>
								<div className="catalog-preview-panel grid gap-2 border p-3">
									<div className="h-2 w-2/3 rounded-[var(--preview-radius)] bg-[var(--preview-muted)]" />
									<div className="h-2 w-full rounded-[var(--preview-radius)] bg-[var(--preview-border)]" />
									<div className="catalog-preview-primary mt-2 w-fit rounded-[var(--preview-radius)] px-3 py-1 text-xs">
										Primary action
									</div>
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

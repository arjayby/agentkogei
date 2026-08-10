import { DesignSystemPreviewTheme } from "@/components/design-system-preview-theme";
import type { DesignSystem } from "@/lib/catalog";

const headlineSizes = {
	compact: "text-3xl",
	balanced: "text-4xl",
	expressive: "text-5xl",
} as const;

export function DesignSystemArtwork({
	designSystem,
}: {
	designSystem: DesignSystem;
}) {
	const { signature, typography } = designSystem.preview;

	return (
		<DesignSystemPreviewTheme designSystem={designSystem}>
			<div
				className="catalog-preview-artwork flex h-64 flex-col justify-between overflow-hidden"
				aria-hidden="true"
			>
				<div className="catalog-preview-accent catalog-preview-muted flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em]">
					<span>{signature.label}</span>
					<span>v{designSystem.currentRelease}</span>
				</div>
				<div className="flex flex-col gap-4">
					<p
						className={`catalog-preview-display max-w-sm font-medium leading-[0.92] tracking-[-0.045em] ${headlineSizes[typography.scale]}`}
					>
						{signature.headline}
					</p>
					<div className="flex flex-wrap gap-2">
						{signature.principles.map((principle, index) => (
							<span
								key={principle}
								className={
									index === 0
										? "catalog-preview-primary rounded-[var(--preview-radius)] px-3 py-1 text-xs"
										: "catalog-preview-panel border px-3 py-1 text-xs"
								}
							>
								{principle}
							</span>
						))}
					</div>
				</div>
				<div className="grid grid-cols-4 gap-1" aria-hidden="true">
					<div className="h-1 bg-[var(--preview-primary)]" />
					<div className="h-1 bg-[var(--preview-success)]" />
					<div className="h-1 bg-[var(--preview-warning)]" />
					<div className="h-1 bg-[var(--preview-info)]" />
				</div>
			</div>
		</DesignSystemPreviewTheme>
	);
}

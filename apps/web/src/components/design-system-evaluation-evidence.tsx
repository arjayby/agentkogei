import type { DesignSystem } from "@/lib/catalog";

export function DesignSystemEvaluationEvidence({
	designSystem,
}: {
	designSystem: DesignSystem;
}) {
	const { evidencePresentation } = designSystem.preview;

	return (
		<section
			aria-label={`${designSystem.name} public evaluation evidence`}
			className="catalog-preview-panel grid gap-4 border p-5 md:grid-cols-3"
		>
			<div>
				<h4 className="font-medium">Preview</h4>
				<p className="mt-2 text-muted-foreground text-sm leading-6">
					{evidencePresentation.preview}
				</p>
			</div>
			<div>
				<h4 className="font-medium">Design Contract</h4>
				<p className="mt-2 text-muted-foreground text-sm leading-6">
					{evidencePresentation.designContract}
				</p>
			</div>
			<div>
				<h4 className="font-medium">Evaluation evidence</h4>
				<p className="mt-2 text-muted-foreground text-sm leading-6">
					{evidencePresentation.evaluation}
				</p>
			</div>
		</section>
	);
}

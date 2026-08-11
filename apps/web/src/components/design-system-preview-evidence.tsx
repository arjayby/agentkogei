import type { ReactNode } from "react";
import {
	catalogMetadataLabel,
	type DesignSystem,
	type PreviewShell,
	previewShellFor,
} from "@/lib/catalog";

type ProductSurfaces = NonNullable<PreviewShell["productSurfaces"]>;
type ProductSurface = keyof ProductSurfaces["examples"];
type ProductSurfaceExample = ProductSurfaces["examples"][ProductSurface];

function ProductSurfacePanel({
	children,
	example,
}: {
	children: ReactNode;
	example: ProductSurfaceExample;
}) {
	return (
		<div className="catalog-preview-panel flex flex-col gap-3 border p-4">
			<h4 className="font-medium">{example.title}</h4>
			<p className="text-muted-foreground text-sm leading-6">
				{example.description}
			</p>
			{children}
		</div>
	);
}

function InputSurfaceStructure({
	example,
	label,
}: {
	example: ProductSurfaceExample;
	label: string;
}) {
	return (
		<section
			aria-label={label}
			className="catalog-preview-panel flex flex-col gap-3 border p-4"
		>
			<h4 className="font-medium">{example.title}</h4>
			<p className="text-muted-foreground text-sm leading-6">
				{example.description}
			</p>
			{example.elements.map((element) => (
				<div key={element} className="grid gap-2 text-xs">
					<p>{element}</p>
					<span
						aria-hidden="true"
						className="h-8 border border-[var(--preview-border)] bg-[var(--preview-background)]"
					/>
				</div>
			))}
		</section>
	);
}

function ProductSurfaceStructure({
	example,
	surface,
}: {
	example: ProductSurfaceExample;
	surface: ProductSurface;
}) {
	if (surface === "marketing") {
		return (
			<section
				aria-label="Marketing action hierarchy"
				className="catalog-preview-panel flex flex-col gap-3 border p-4"
			>
				<p className="catalog-preview-display text-xl">{example.title}</p>
				<p className="text-muted-foreground text-sm leading-6">
					{example.description}
				</p>
				<p className="catalog-preview-primary w-fit rounded-[var(--preview-radius)] px-3 py-2 text-xs">
					{example.elements.at(-1)}
				</p>
			</section>
		);
	}

	if (surface === "authentication") {
		return (
			<InputSurfaceStructure
				example={example}
				label="Authentication input structure"
			/>
		);
	}

	if (surface === "onboarding") {
		return (
			<ProductSurfacePanel example={example}>
				<ol
					aria-label="Onboarding progress structure"
					className="grid grid-cols-2 gap-2 text-xs"
				>
					{example.elements.map((element, index) => (
						<li key={element} className="border p-2">
							<span className="font-mono">{index + 1}</span> {element}
						</li>
					))}
				</ol>
			</ProductSurfacePanel>
		);
	}

	if (surface === "dashboard") {
		return (
			<ProductSurfacePanel example={example}>
				<ul
					aria-label="Dashboard summary regions"
					className="grid grid-cols-2 gap-2 text-xs"
				>
					{example.elements.map((element) => (
						<li key={element} className="border p-3">
							{element}
						</li>
					))}
				</ul>
			</ProductSurfacePanel>
		);
	}

	if (surface === "table") {
		return (
			<ProductSurfacePanel example={example}>
				<table
					aria-label="Table comparison structure"
					className="w-full border-collapse text-left text-xs"
				>
					<thead>
						<tr className="border-b">
							<th scope="col" className="p-2">
								Region
							</th>
							<th scope="col" className="p-2">
								Treatment
							</th>
						</tr>
					</thead>
					<tbody>
						{example.elements.map((element) => (
							<tr key={element} className="border-b last:border-b-0">
								<th scope="row" className="p-2 font-normal">
									{element}
								</th>
								<td className="p-2">Labelled and adaptable</td>
							</tr>
						))}
					</tbody>
				</table>
			</ProductSurfacePanel>
		);
	}

	if (surface === "form") {
		return (
			<InputSurfaceStructure example={example} label="Form input structure" />
		);
	}

	if (surface === "settings") {
		return (
			<ProductSurfacePanel example={example}>
				<ul aria-label="Settings preference groups" className="grid text-xs">
					{example.elements.map((element) => (
						<li key={element} className="border-b py-2 last:border-b-0">
							{element}
						</li>
					))}
				</ul>
			</ProductSurfacePanel>
		);
	}

	return (
		<ProductSurfacePanel example={example}>
			<ul
				aria-label="State communication examples"
				className="grid grid-cols-2 gap-2 text-xs"
			>
				{example.elements.map((element) => (
					<li key={element} className="border p-2">
						{element}
					</li>
				))}
			</ul>
		</ProductSurfacePanel>
	);
}

export function DesignSystemPreviewEvidence({
	designSystem,
}: {
	designSystem: DesignSystem;
}) {
	const { signature, surfaces } = designSystem.preview;
	const { evidencePresentation, productSurfaces } =
		previewShellFor(designSystem);

	if (!(evidencePresentation && productSurfaces)) return null;

	return (
		<section
			className="grid gap-8"
			aria-label={`${designSystem.name} rendered Design System Preview`}
		>
			<section
				aria-label={`${designSystem.name} product surface examples`}
				className="grid gap-8"
			>
				<div className="flex max-w-3xl flex-col gap-3">
					<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
						Product surface examples
					</p>
					<h2 className="font-medium text-3xl tracking-tight">
						One direction, eight illustrative structures.
					</h2>
					<p className="text-muted-foreground leading-7">
						{productSurfaces.guidance}
					</p>
				</div>

				<div className="grid gap-px border bg-border md:grid-cols-2 xl:grid-cols-3">
					{surfaces.map((surface, index) => {
						const principle =
							signature.principles[index % signature.principles.length];
						const example = productSurfaces.examples[surface];

						return (
							<article
								key={surface}
								className="catalog-preview-surface flex min-h-72 flex-col justify-between gap-8 p-[var(--preview-space)]"
							>
								<div className="catalog-preview-accent catalog-preview-muted flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em]">
									<h3>{catalogMetadataLabel(surface)}</h3>
									<span>{String(index + 1).padStart(2, "0")}</span>
								</div>

								<div className="flex flex-col gap-4">
									<p className="catalog-preview-display max-w-xs font-medium text-2xl leading-tight">
										{principle}
									</p>
									<ProductSurfaceStructure
										example={example}
										surface={surface}
									/>
								</div>

								<p className="catalog-preview-accent catalog-preview-muted text-[0.65rem] uppercase tracking-[0.12em]">
									Illustrative structure
								</p>
							</article>
						);
					})}
				</div>
			</section>

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
		</section>
	);
}

import { buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignSystemBehaviorSpecimen } from "@/components/design-system-behavior-specimen";
import { DesignSystemControlsSpecimen } from "@/components/design-system-controls-specimen";
import { DesignSystemEvaluationEvidence } from "@/components/design-system-evaluation-evidence";
import { DesignSystemFoundationsSpecimen } from "@/components/design-system-foundations-specimen";
import { DesignSystemInteractionsSpecimen } from "@/components/design-system-interactions-specimen";
import { DesignSystemMark } from "@/components/design-system-mark";
import { DesignSystemPreviewTheme } from "@/components/design-system-preview-theme";
import { InstallationCommand } from "@/components/installation-command";
import {
	catalogMetadataLabel,
	compatibilityText,
	contractSections,
	currentRelease,
	designSystems,
	evaluationText,
	getDesignSystem,
	previewSurfaceNames,
} from "@/lib/catalog";

type DesignSystemPageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return designSystems.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: DesignSystemPageProps): Promise<Metadata> {
	const { slug } = await params;
	const designSystem = getDesignSystem(slug);

	if (!designSystem) {
		return {};
	}

	return {
		title: `${designSystem.name} Design System Preview | AgentKogei`,
		description: `${designSystem.name} Design System: ${designSystem.preview.summary}`,
	};
}

export default async function DesignSystemPage({
	params,
}: DesignSystemPageProps) {
	const { slug } = await params;
	const designSystem = getDesignSystem(slug);

	if (!designSystem) {
		notFound();
	}

	const release = currentRelease(designSystem);
	const {
		accessibility,
		composition,
		controls,
		interactions,
		motion,
		reducedMotion,
	} = designSystem.preview;
	const previewSurfaces = previewSurfaceNames(designSystem.preview);
	const actionHref =
		`/contracts/${designSystem.slug}/${release.version}` as Route;
	const actionLabel = `Read the ${designSystem.name} ${release.version} Design Contract`;
	const retrievalNote = `${designSystem.name} is retrieved anonymously from AgentKogei's public Design Systems collection. The CLI shows the absolute target and the exact change before it writes anything.`;

	return (
		<main>
			<section
				data-preview-section="hero"
				className="border-b px-5 py-8 sm:px-8 lg:px-12 lg:py-16"
			>
				<div className="mx-auto flex max-w-7xl flex-col gap-12">
					<div className="flex items-center justify-between gap-6">
						<Link
							href={"/design-systems" as Route}
							className="inline-flex w-fit items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
						>
							<ArrowLeft aria-hidden="true" className="size-4" />
							Design Systems
						</Link>
						<DesignSystemMark
							designSystem={designSystem}
							data-mark-size="compact"
							className="size-8 shrink-0"
						/>
					</div>
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-center">
						<div className="flex flex-col gap-7">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Design System Release {release.version}
							</p>
							<h1 className="font-medium text-6xl tracking-[-0.065em] sm:text-8xl">
								{designSystem.name}
							</h1>
							<p className="max-w-2xl text-pretty text-2xl text-muted-foreground leading-9">
								{designSystem.preview.summary} Built for{" "}
								{designSystem.preview.intendedFit.toLowerCase()}.
							</p>
							<div className="flex max-w-2xl flex-col gap-3">
								<p className="text-lg">
									{designSystem.preview.signature.headline}
								</p>
								<ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-sm">
									{designSystem.preview.signature.principles.map(
										(principle) => (
											<li key={principle}>{principle}</li>
										),
									)}
								</ul>
							</div>
							<div>
								<Link
									href={actionHref}
									className={buttonVariants({ size: "lg" })}
								>
									{actionLabel}
									<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
								</Link>
							</div>
						</div>
						<div className="grid aspect-square place-items-center border bg-card p-10 sm:p-14">
							<DesignSystemMark
								designSystem={designSystem}
								data-mark-size="hero"
								className="size-full max-h-72 max-w-72"
							/>
						</div>
					</div>
				</div>
			</section>

			<section
				data-preview-section="installation"
				className="border-b px-5 py-12 sm:px-8 lg:px-12"
			>
				<div className="mx-auto max-w-7xl">
					<InstallationCommand
						designSystems={[
							{ slug: designSystem.slug, name: designSystem.name },
						]}
					>
						{retrievalNote}
					</InstallationCommand>
				</div>
			</section>

			<DesignSystemPreviewTheme designSystem={designSystem}>
				<section
					data-preview-section="exploration"
					data-preview-themed-specimen
					data-preview-composition={composition}
					className="border-b px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
					aria-label={`${designSystem.name} rendered Design System Preview`}
				>
					<div className="mx-auto max-w-7xl">
						<div
							data-preview-exploration-heading
							className="mb-10 flex flex-col gap-3"
						>
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Design System Preview / Rendered evidence
							</p>
							<h2 className="font-medium text-3xl tracking-tight sm:text-5xl">
								One direction across the whole product.
							</h2>
							<p className="max-w-2xl text-muted-foreground">
								Preview is evidence, not the Design Contract. It demonstrates
								direction and evaluated coverage; the Design Contract itself is
								public, so you can read every word before you add it.
							</p>
						</div>
						<div
							data-preview-exploration-sections
							className="grid gap-12 lg:gap-20"
						>
							<DesignSystemFoundationsSpecimen designSystem={designSystem} />
							<DesignSystemControlsSpecimen
								composition={composition}
								controls={controls}
								name={designSystem.name}
								slug={designSystem.slug}
							/>
							<DesignSystemInteractionsSpecimen
								composition={composition}
								interactions={interactions}
								name={designSystem.name}
							/>
							<DesignSystemBehaviorSpecimen
								accessibility={accessibility}
								composition={composition}
								motion={motion}
								name={designSystem.name}
								reducedMotion={reducedMotion}
							/>
							<DesignSystemEvaluationEvidence designSystem={designSystem} />
						</div>
					</div>
				</section>
			</DesignSystemPreviewTheme>

			<section
				data-preview-section="release-details"
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="release-details-heading"
			>
				<div className="mx-auto max-w-7xl">
					<div className="mb-10 flex flex-col gap-3">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Release {release.version}
						</p>
						<h2
							id="release-details-heading"
							className="font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Release details
						</h2>
					</div>
					<div className="grid gap-5 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>
									<h2>Release evidence</h2>
								</CardTitle>
								<CardDescription>
									Public metadata for release {release.version}.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<dl className="grid gap-px bg-border">
									<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
										<dt className="font-mono text-muted-foreground text-xs uppercase">
											Compatibility
										</dt>
										<dd>{compatibilityText(designSystem)}</dd>
									</div>
									<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
										<dt className="font-mono text-muted-foreground text-xs uppercase">
											Evaluation
										</dt>
										<dd>{evaluationText(designSystem)}</dd>
									</div>
									<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
										<dt className="font-mono text-muted-foreground text-xs uppercase">
											Evidence coverage
										</dt>
										<dd>
											<ul className="flex flex-col gap-1">
												<li>{designSystem.evaluation.viewports.join(" · ")}</li>
												<li>
													{designSystem.evaluation.colorSchemes
														.map((colorScheme) =>
															catalogMetadataLabel(colorScheme),
														)
														.join(" · ")}{" "}
													· Reduced motion
												</li>
												<li>
													Human review{" "}
													{designSystem.evaluation.humanReview.status} · Rights
													review{" "}
													{designSystem.evaluation.humanReview.rightsReview}
												</li>
												<li>
													{designSystem.evaluation.agentGenerationRuns} agent
													generation runs
												</li>
												<li>
													{designSystem.evaluation.automatedChecks.join(" · ")}
												</li>
												<li>{designSystem.evaluation.evidence.join(" · ")}</li>
											</ul>
										</dd>
									</div>
								</dl>
							</CardContent>
						</Card>

						<Card role="region" aria-labelledby="coverage-heading">
							<CardHeader>
								<CardTitle>
									<h2 id="coverage-heading">Coverage</h2>
								</CardTitle>
								<CardDescription>
									Required surfaces and system states.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="grid gap-3 sm:grid-cols-2">
									{previewSurfaces.map((item) => (
										<li key={item} className="flex gap-3 text-sm leading-6">
											<Check aria-hidden="true" className="mt-1 shrink-0" />
											{catalogMetadataLabel(item)}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>
									<h2>Inside the Design Contract</h2>
								</CardTitle>
								<CardDescription>
									Installation writes one root DESIGN.md and nothing beside it.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-6">
								<ul className="flex flex-col gap-3">
									{contractSections.map((section) => (
										<li
											key={section}
											className="border-b pb-3 last:border-b-0 last:pb-0"
										>
											{section}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>
									<h3>Design Contract and changelog</h3>
								</CardTitle>
								<CardDescription>
									The complete agent direction for Release {release.version}.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-5">
								<p className="font-mono text-sm">Release {release.version}</p>
								<div>
									<h3 className="mb-2 font-medium text-base">Changelog</h3>
									<p className="text-muted-foreground leading-7">
										{release.changelog.summary}
									</p>
								</div>
								<Link
									href={actionHref}
									className="w-fit font-medium text-sm underline underline-offset-4"
								>
									Read {designSystem.name} {release.version} Design Contract
								</Link>
								<details className="border-t pt-5">
									<summary className="cursor-pointer font-medium text-sm underline underline-offset-4">
										View raw Design Contract
									</summary>
									<iframe
										src={actionHref}
										title={`${designSystem.name} raw Design Contract`}
										loading="lazy"
										className="mt-4 h-96 w-full border bg-muted"
									/>
								</details>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</main>
	);
}

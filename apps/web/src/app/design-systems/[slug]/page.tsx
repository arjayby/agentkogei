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
import { DesignSystemArtwork } from "@/components/design-system-artwork";
import { DesignSystemPreviewEvidence } from "@/components/design-system-preview-evidence";
import { InstallationCommand } from "@/components/installation-command";
import {
	catalogMetadataLabel,
	compatibilityText,
	contractSections,
	currentRelease,
	designSystems,
	evaluationText,
	formatPublishedAt,
	getDesignSystem,
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
	const actionHref =
		`/contracts/${designSystem.slug}/${release.version}` as Route;
	const actionLabel = `Read the ${designSystem.name} ${release.version} Design Contract`;
	const retrievalNote = `${designSystem.name} is retrieved anonymously from AgentKogei's public Design Systems collection. The CLI shows the absolute target and the exact change before it writes anything.`;

	return (
		<main>
			<header className="border-b px-5 py-8 sm:px-8 lg:px-12">
				<div className="mx-auto max-w-7xl">
					<Link
						href={"/design-systems" as Route}
						className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Design Systems
					</Link>
				</div>
			</header>

			<section className="border-b px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)] lg:items-end">
					<div className="flex flex-col gap-8">
						<div className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Design System Release {release.version}
						</div>
						<h1 className="font-medium text-6xl tracking-[-0.065em] sm:text-8xl">
							{designSystem.name}
						</h1>
						<p className="max-w-2xl text-pretty text-2xl text-muted-foreground leading-9">
							{designSystem.preview.summary} Built for{" "}
							{designSystem.preview.intendedFit.toLowerCase()}.
						</p>
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
					<DesignSystemArtwork designSystem={designSystem} />
				</div>
			</section>

			<section className="border-b px-5 py-12 sm:px-8 lg:px-12">
				<div className="mx-auto max-w-7xl">
					<InstallationCommand identity={designSystem.slug}>
						{retrievalNote}
					</InstallationCommand>
				</div>
			</section>

			<section
				className="border-b px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="preview-heading"
			>
				<div className="mx-auto max-w-7xl">
					<div className="mb-10 flex flex-col gap-3">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Design System Preview / Rendered evidence
						</p>
						<h2
							id="preview-heading"
							className="font-medium text-3xl tracking-tight sm:text-5xl"
						>
							One direction across the whole product.
						</h2>
						<p className="max-w-2xl text-muted-foreground">
							Preview is evidence, not the Design Contract. It demonstrates
							direction and evaluated coverage; the Design Contract itself is
							public, so you can read every word before you add it.
						</p>
					</div>
					<DesignSystemPreviewEvidence designSystem={designSystem} />
				</div>
			</section>

			<section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
				<div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
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
								{designSystem.preview.surfaces.map((item) => (
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
								<h2>Release history</h2>
							</CardTitle>
							<CardDescription>
								Immutable two part Design System Releases, newest first.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-8">
							{designSystem.releases.map((published) => (
								<div key={published.version} className="flex flex-col gap-2">
									<div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
										<span className="font-mono">v{published.version}</span>
										<span className="text-muted-foreground">
											Published {formatPublishedAt(published.publishedAt)}
										</span>
									</div>
									<div>
										<h3 className="mb-2 font-medium text-base">Changelog</h3>
										<p className="text-muted-foreground leading-7">
											{published.changelog.summary}
										</p>
									</div>
									<Link
										href={
											`/contracts/${designSystem.slug}/${published.version}` as Route
										}
										className="w-fit font-medium text-sm underline underline-offset-4"
									>
										Read {designSystem.name} {published.version} Design Contract
									</Link>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}

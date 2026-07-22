import { Badge } from "@agentkogei/ui/components/badge";
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

import { InstallationCommand } from "@/components/installation-command";
import { PackArtwork } from "@/components/pack-artwork";
import { PackPreviewEvidence } from "@/components/pack-preview-evidence";
import {
	contractSections,
	currentRelease,
	designPacks,
	getDesignPack,
	premiumValueStatement,
} from "@/lib/catalog";

type PackPageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return designPacks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PackPageProps): Promise<Metadata> {
	const { slug } = await params;
	const pack = getDesignPack(slug);

	if (!pack) {
		return {};
	}

	return {
		title: `${pack.name} Pack Preview — AgentKogei`,
		description: pack.direction,
	};
}

export default async function PackPage({ params }: PackPageProps) {
	const { slug } = await params;
	const pack = getDesignPack(slug);

	if (!pack) {
		notFound();
	}

	const release = currentRelease(pack);
	const isOpen = pack.access === "Open";
	// An Open Design Pack is genuinely inspectable, so its Pack Preview links
	// straight to the raw Design Contract a Project would install. A Premium
	// Design Contract is the subscription's value, so its Pack Preview offers
	// Premium Access instead.
	const actionHref = (
		isOpen ? `/contracts/${pack.slug}/${release.version}` : "/pricing"
	) as Route;
	const actionLabel = isOpen
		? `Read the ${pack.name} ${release.version} Design Contract`
		: "Explore Premium Access";
	const accessNote = isOpen
		? `${pack.name} is an Open Design Pack, so add retrieves it without an AgentKogei account. The CLI shows the absolute target and the exact change before it writes anything.`
		: `${pack.name} is a Premium Design Pack, so add needs active Premium Access. When the CLI holds no Pack Credential it starts browser authorization and resumes the same Installation after you approve it.`;

	return (
		<main>
			<header className="border-b px-5 py-8 sm:px-8 lg:px-12">
				<div className="mx-auto max-w-7xl">
					<Link
						href={"/catalog" as Route}
						className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Official Catalog
					</Link>
				</div>
			</header>

			<section className="border-b px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)] lg:items-end">
					<div className="flex flex-col gap-8">
						<div className="flex flex-wrap items-center gap-3 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							<Badge variant="outline">{pack.access}</Badge>
							<span aria-hidden="true">/</span>
							<span>Release {release.version}</span>
						</div>
						<h1 className="font-medium text-6xl tracking-[-0.065em] sm:text-8xl">
							{pack.name}
						</h1>
						<p className="max-w-2xl text-pretty text-2xl text-muted-foreground leading-9">
							{pack.direction} Built for {pack.bestFor.toLowerCase()}.
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
					<PackArtwork pack={pack} />
				</div>
			</section>

			<section className="border-b px-5 py-12 sm:px-8 lg:px-12">
				<div className="mx-auto max-w-7xl">
					<InstallationCommand identity={pack.slug}>
						{accessNote}
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
							Pack Preview / Rendered evidence
						</p>
						<h2
							id="preview-heading"
							className="font-medium text-3xl tracking-tight sm:text-5xl"
						>
							One direction across the whole product.
						</h2>
						<p className="max-w-2xl text-muted-foreground">
							{isOpen
								? "Preview is evidence, not the Design Contract. It demonstrates direction and evaluated coverage; the Design Contract itself is public, so you can read every word before you add it."
								: "Preview is evidence, not the Design Contract. The Official Catalog delivers the complete Pack Release only to a CLI authorized by a Builder with active Premium Access."}
						</p>
					</div>
					<PackPreviewEvidence pack={pack} />
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
									<dd>{pack.compatibility}</dd>
								</div>
								<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
									<dt className="font-mono text-muted-foreground text-xs uppercase">
										Evaluation
									</dt>
									<dd>{pack.evaluation}</dd>
								</div>
								<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
									<dt className="font-mono text-muted-foreground text-xs uppercase">
										Evidence coverage
									</dt>
									<dd>
										<ul className="flex flex-col gap-1">
											{pack.evaluationEvidence.map((evidence) => (
												<li key={evidence}>{evidence}</li>
											))}
										</ul>
									</dd>
								</div>
								<div className="grid gap-2 bg-background p-4 sm:grid-cols-[10rem_1fr]">
									<dt className="font-mono text-muted-foreground text-xs uppercase">
										Pack License
									</dt>
									<dd>
										<strong className="font-medium">{pack.license}</strong>
										<span className="mt-1 block text-muted-foreground">
											{pack.licenseSummary}
										</span>
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								<h2>Coverage</h2>
							</CardTitle>
							<CardDescription>
								Required surfaces and system states.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="grid gap-3 sm:grid-cols-2">
								{pack.coverage.map((item) => (
									<li key={item} className="flex gap-3 text-sm leading-6">
										<Check aria-hidden="true" className="mt-1 shrink-0" />
										{item}
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
							{isOpen ? null : (
								<p className="text-muted-foreground leading-7">
									{premiumValueStatement}
								</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								<h2>Release history</h2>
							</CardTitle>
							<CardDescription>
								Immutable semantic Pack Releases, newest first.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-8">
							{pack.releases.map((published) => (
								<div key={published.version} className="flex flex-col gap-2">
									<div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
										<span className="font-mono">v{published.version}</span>
										<span className="text-muted-foreground">
											Published {published.publishedAt}
										</span>
									</div>
									<div>
										<h3 className="mb-2 font-medium text-base">Changelog</h3>
										<p className="text-muted-foreground leading-7">
											{published.changelog}
										</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}

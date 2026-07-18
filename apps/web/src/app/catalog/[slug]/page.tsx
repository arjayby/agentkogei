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

import { PackArtwork } from "@/components/pack-artwork";
import { designPacks, getDesignPack } from "@/lib/catalog";

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

	const actionHref = (pack.access === "Open" ? "/docs" : "/pricing") as Route;
	const actionLabel =
		pack.access === "Open"
			? "Read Installation guide"
			: "Explore Premium Access";

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
							<span>{pack.access}</span>
							<span aria-hidden="true">/</span>
							<span>Release {pack.release}</span>
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
					</div>
					<div className="grid gap-px border bg-border md:grid-cols-3">
						{["Marketing", "Authentication", "Product UI"].map(
							(surface, index) => (
								<div
									key={surface}
									className="flex min-h-64 flex-col justify-between bg-background p-5"
								>
									<div className="flex items-center justify-between font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.16em]">
										<span>{surface}</span>
										<span>0{index + 1}</span>
									</div>
									<div className="flex flex-col gap-3">
										<div className="h-12 w-2/3 bg-foreground" />
										<div className="h-2 w-full bg-muted" />
										<div className="h-2 w-4/5 bg-muted" />
										<div className="mt-4 grid grid-cols-3 gap-2">
											<div className="h-16 bg-muted" />
											<div className="h-16 bg-muted" />
											<div className="h-16 bg-muted" />
										</div>
									</div>
								</div>
							),
						)}
					</div>
				</div>
			</section>

			<section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
				<div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>
								<h2 className="font-medium text-2xl tracking-tight">
									Release evidence
								</h2>
							</CardTitle>
							<CardDescription>
								Public metadata for release {pack.release}.
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
								<h2 className="font-medium text-2xl tracking-tight">
									Coverage
								</h2>
							</CardTitle>
							<CardDescription>
								Required surfaces and system states.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="grid gap-3 sm:grid-cols-2">
								{pack.coverage.map((item) => (
									<li key={item} className="flex gap-3 text-sm leading-6">
										<Check
											aria-hidden="true"
											className="mt-1 size-4 shrink-0"
										/>
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								<h2 className="font-medium text-2xl tracking-tight">
									Included resources
								</h2>
							</CardTitle>
							<CardDescription>
								Descriptions only for Premium Pack Preview resources.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="flex flex-col gap-3">
								{pack.resources.map((resource) => (
									<li
										key={resource}
										className="border-b pb-3 last:border-b-0 last:pb-0"
									>
										{resource}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								<h2 className="font-medium text-2xl tracking-tight">
									Release history
								</h2>
							</CardTitle>
							<CardDescription>
								Immutable semantic Pack Releases.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-8">
							<div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
								<span className="font-mono">v{pack.release}</span>
								<span className="text-muted-foreground">
									Published {pack.publishedAt}
								</span>
							</div>
							<div>
								<h3 className="mb-2 font-medium text-base">Changelog</h3>
								<p className="text-muted-foreground leading-7">
									{pack.changelog}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}

import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import {
	type InstallablePack,
	InstallationCommand,
} from "@/components/installation-command";
import { PackCard } from "@/components/pack-card";
import { designPacks, recentPackReleases } from "@/lib/catalog";

const installablePacks: readonly InstallablePack[] = designPacks.map(
	({ slug, name, access }) => ({ slug, name, access }),
);

export default function Home() {
	const recent = recentPackReleases(2);

	return (
		<main>
			<section className="border-b px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
				<div className="mx-auto flex max-w-7xl flex-col gap-10">
					<div className="flex flex-col gap-8">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Design direction for agent-built products
						</p>
						<h1 className="max-w-5xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92]">
							One interface system. Every agent. Every screen.
						</h1>
					</div>
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,30rem)] lg:items-end lg:gap-16">
						<div className="flex min-w-0 flex-col gap-8">
							<p className="max-w-2xl text-pretty text-lg text-muted-foreground leading-8 lg:text-xl">
								Left alone, every coding agent makes its own calls on type,
								color, layout, components, and states. The result is design
								drift across your Project. AgentKogei gives all of them one
								visual and behavioral foundation.
							</p>
							<div className="flex gap-3">
								<Link
									href={"/catalog" as Route}
									className={buttonVariants({ size: "lg" })}
								>
									Browse the Catalog
									<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
								</Link>
								<Link
									href={"/docs" as Route}
									className={buttonVariants({ variant: "outline", size: "lg" })}
								>
									Read the Docs
								</Link>
							</div>
							<InstallationCommand packs={installablePacks} />
						</div>
					</div>
				</div>
			</section>

			<section
				className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
				aria-labelledby="recent-heading"
			>
				<div className="mx-auto flex max-w-7xl flex-col gap-10">
					<div>
						<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							01 / Recently published
						</p>
						<h2
							id="recent-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							The newest Pack Releases.
						</h2>
					</div>
					<div className="grid gap-px border bg-border sm:grid-cols-2">
						{recent.map(({ pack, release }) => (
							<Link
								key={pack.slug}
								href={`/catalog/${pack.slug}` as Route}
								className="group flex min-h-56 flex-col justify-between gap-6 bg-background p-6 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
							>
								<div className="flex items-baseline justify-between gap-4 font-mono text-xs">
									<span>
										{pack.name} {release.version}
									</span>
									<span className="text-muted-foreground">
										{release.publishedAt}
									</span>
								</div>
								<p className="max-w-md text-lg leading-7">
									{release.changelog}
								</p>
								<span className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em]">
									View pack
									<ArrowUpRight className="size-3.5" aria-hidden="true" />
								</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section
				className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
				aria-labelledby="catalog-heading"
			>
				<div className="mx-auto flex max-w-7xl flex-col gap-10">
					<div className="flex flex-wrap items-end justify-between gap-6">
						<div>
							<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
								02 / Official Catalog
							</p>
							<h2
								id="catalog-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								One catalog. Four directions.
							</h2>
						</div>
						<Link
							href={"/catalog" as Route}
							className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em] transition-colors hover:text-foreground"
						>
							Browse the Official Catalog
							<ArrowUpRight className="size-3.5" aria-hidden="true" />
						</Link>
					</div>
					<div className="grid gap-5 md:grid-cols-2">
						{designPacks.map((pack, index) => (
							<PackCard key={pack.slug} pack={pack} index={index} />
						))}
					</div>
				</div>
			</section>

			<section
				className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
				aria-labelledby="premium-heading"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-24">
					<div>
						<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							03 / Premium Access
						</p>
						<h2
							id="premium-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Unlock Command and Signal.
						</h2>
					</div>
					<div className="flex flex-col gap-6">
						<p className="max-w-xl text-pretty text-lg text-muted-foreground leading-8">
							Command and Signal carry the most distinctive directions in the
							Official Catalog. Premium Access unlocks both, and a pack you
							install while access is active keeps working in that Project after
							access expires.
						</p>
						<div>
							<Link
								href={"/premium" as Route}
								className={buttonVariants({ size: "lg" })}
							>
								Explore Premium Access
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

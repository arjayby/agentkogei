import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { DesignSystemCard } from "@/components/design-system-card";
import { HeroArtwork } from "@/components/hero-artwork";
import {
	type InstallableDesignSystem,
	InstallationCommand,
} from "@/components/installation-command";
import { designSystems } from "@/lib/catalog";

const installableDesignSystems: readonly InstallableDesignSystem[] =
	designSystems.map(({ slug, name }) => ({ slug, name }));

export default function Home() {
	return (
		<main>
			<section className="border-b px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
				<div className="hero-layout mx-auto max-w-7xl">
					<div className="hero-copy">
						<div className="hero-intro flex flex-col gap-8">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
								Complete design systems for coding agents
							</p>
							<h1 className="text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92]">
								Give your agents better taste.
							</h1>
						</div>
						<p className="hero-description max-w-2xl text-pretty text-lg text-muted-foreground leading-8 lg:text-xl">
							Without clear direction, agents produce generic design slop.
							Install one complete design system. Keep every agent and every
							screen consistent.
						</p>
						<div className="hero-action">
							<Link
								href={"/catalog" as Route}
								className={buttonVariants({ size: "lg" })}
							>
								Choose a design system
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
						<div className="hero-installation">
							<InstallationCommand designSystems={installableDesignSystems} />
						</div>
					</div>
					<HeroArtwork className="hero-visual" />
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
								Published visual directions
							</p>
							<h2
								id="catalog-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Choose your taste.
							</h2>
							<p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground leading-8">
								Pick one visual direction for your project. Your agents use it
								for every screen, state, and interaction.
							</p>
						</div>
						<Link
							href={"/catalog" as Route}
							className="inline-flex items-center gap-1 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em] transition-colors hover:text-foreground"
						>
							View all design systems
							<ArrowUpRight className="size-3.5" aria-hidden="true" />
						</Link>
					</div>
					<div className="grid gap-5 md:grid-cols-2">
						{designSystems.map((designSystem, index) => (
							<DesignSystemCard
								key={designSystem.slug}
								designSystem={designSystem}
								index={index}
							/>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}

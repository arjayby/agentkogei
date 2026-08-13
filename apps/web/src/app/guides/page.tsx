import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { guidesSocialCard, socialMetadata } from "@/lib/social-metadata";

export const metadata: Metadata = socialMetadata(guidesSocialCard);

export default function GuidesPage() {
	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-end">
					<div className="flex flex-col gap-5">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							AgentKogei Guides
						</p>
						<h1 className="text-balance font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
							Guides for durable agent direction.
						</h1>
					</div>
					<p className="max-w-xl text-pretty text-lg text-muted-foreground leading-8">
						Understand how an Installed Design System becomes lasting Project
						direction, then choose the right Design System for your product.
					</p>
				</div>
			</header>

			<section
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="available-guides-heading"
			>
				<div className="mx-auto flex max-w-7xl flex-col gap-6">
					<h2 id="available-guides-heading" className="sr-only">
						Available guides
					</h2>
					{guides.map((guide) => (
						<article
							key={guide.route}
							className="grid gap-8 border p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.6fr)] lg:items-end"
						>
							<div className="flex max-w-3xl flex-col gap-5">
								<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
									{guide.card.label}
								</p>
								<h2 className="text-balance font-medium text-3xl tracking-tight sm:text-5xl">
									{guide.card.title}
								</h2>
								<p className="text-pretty text-lg text-muted-foreground leading-8">
									{guide.card.body}
								</p>
							</div>
							<div className="flex lg:justify-end">
								<Link
									href={guide.route as Route}
									className={buttonVariants({ size: "lg" })}
								>
									{guide.card.linkLabel}
									<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
								</Link>
							</div>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}

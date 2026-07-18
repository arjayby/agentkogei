import { Badge } from "@agentkogei/ui/components/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { PackArtwork } from "@/components/pack-artwork";
import { designPacks } from "@/lib/catalog";

export const metadata: Metadata = {
	title: "Official Catalog — AgentKogei",
	description: "Browse AgentKogei's four launch Design Packs.",
};

export default function CatalogPage() {
	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-end">
					<div className="flex flex-col gap-5">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Official Catalog / Launch collection
						</p>
						<h1 className="font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
							Four systems. Four voices.
						</h1>
					</div>
					<p className="max-w-xl text-lg text-muted-foreground leading-8">
						Every Published Pack meets the same completeness, accessibility, and
						Pack Evaluation standard. Choose the direction that fits your
						Project.
					</p>
				</div>
			</header>

			<section
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-label="Launch Design Packs"
			>
				<div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
					{designPacks.map((pack, index) => (
						<Link
							key={pack.slug}
							href={`/catalog/${pack.slug}` as Route}
							className="group outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<Card className="h-full transition-transform group-hover:-translate-y-1">
								<CardContent className="-mt-(--card-spacing)">
									<PackArtwork pack={pack} />
								</CardContent>
								<CardHeader>
									<CardTitle>{pack.name}</CardTitle>
									<CardAction>
										<Badge variant="outline">{pack.access}</Badge>
									</CardAction>
									<CardDescription>{pack.direction}</CardDescription>
								</CardHeader>
								<CardFooter className="justify-between">
									<span className="font-mono text-muted-foreground text-xs">
										0{index + 1} / {pack.bestFor}
									</span>
									<ArrowUpRight aria-hidden="true" />
								</CardFooter>
							</Card>
						</Link>
					))}
				</div>
			</section>
		</main>
	);
}

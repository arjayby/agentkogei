import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { PackArtwork } from "@/components/pack-artwork";
import type { DesignSystem } from "@/lib/catalog";

/** The Official Catalog card for one Design System. */
export function PackCard({
	designSystem,
	index,
}: {
	designSystem: DesignSystem;
	index: number;
}) {
	return (
		<Link
			href={`/catalog/${designSystem.slug}` as Route}
			className="group outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<Card className="h-full transition-transform group-hover:-translate-y-1">
				<CardContent className="-mt-(--card-spacing)">
					<PackArtwork pack={designSystem} />
				</CardContent>
				<CardHeader>
					<CardTitle>{designSystem.name}</CardTitle>
					<CardDescription>{designSystem.direction}</CardDescription>
				</CardHeader>
				<CardFooter className="justify-between">
					<span className="font-mono text-muted-foreground text-xs">
						0{index + 1} / {designSystem.bestFor}
					</span>
					<ArrowUpRight aria-hidden="true" />
				</CardFooter>
			</Card>
		</Link>
	);
}

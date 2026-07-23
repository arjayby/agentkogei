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
import type { Route } from "next";
import Link from "next/link";

import { PackArtwork } from "@/components/pack-artwork";
import type { DesignPack } from "@/lib/catalog";

/** The Official Catalog card for one Design Pack, linking to its Pack page. */
export function PackCard({ pack, index }: { pack: DesignPack; index: number }) {
	return (
		<Link
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
	);
}

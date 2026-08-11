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

import { DesignSystemArtwork } from "@/components/design-system-artwork";
import type { DesignSystem } from "@/lib/catalog";

/** A discovery card for one Design System. */
export function DesignSystemCard({
	designSystem,
	index,
}: {
	designSystem: DesignSystem;
	index: number;
}) {
	return (
		<Link
			href={designSystem.preview.route as Route}
			className="group outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<Card className="h-full transition-transform group-hover:-translate-y-1">
				<CardContent className="-mt-(--card-spacing)">
					<DesignSystemArtwork designSystem={designSystem} />
				</CardContent>
				<CardHeader>
					<CardTitle>{designSystem.name}</CardTitle>
					<CardDescription>{designSystem.preview.summary}</CardDescription>
				</CardHeader>
				<CardFooter className="justify-between">
					<span className="font-mono text-muted-foreground text-xs">
						{String(index + 1).padStart(2, "0")} /{" "}
						{designSystem.preview.intendedFit}
					</span>
					<ArrowUpRight aria-hidden="true" />
				</CardFooter>
			</Card>
		</Link>
	);
}

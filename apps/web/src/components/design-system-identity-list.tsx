import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { DesignSystemMark } from "@/components/design-system-mark";
import { DesignSystemPreviewTheme } from "@/components/design-system-preview-theme";
import type { DesignSystem } from "@/lib/catalog";

export function DesignSystemIdentityList({
	designSystems,
}: {
	designSystems: readonly DesignSystem[];
}) {
	return (
		<ul className="border-t">
			{designSystems.map((designSystem) => (
				<li key={designSystem.slug} className="border-b">
					<DesignSystemPreviewTheme designSystem={designSystem}>
						<Link
							href={designSystem.preview.route as Route}
							data-design-system-identity={designSystem.slug}
							className="group grid min-w-0 gap-5 px-3 py-6 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[4rem_minmax(8rem,0.7fr)_minmax(12rem,1.4fr)_minmax(10rem,0.7fr)_auto] sm:items-center sm:px-5"
						>
							<DesignSystemMark
								designSystem={designSystem}
								className="size-14 shrink-0"
								data-mark-size="identity-list"
							/>
							<h3 className="text-xl tracking-tight">{designSystem.name}</h3>
							<p
								data-identity-summary
								className="text-muted-foreground text-sm leading-6"
							>
								{designSystem.preview.summary}
							</p>
							<p
								data-identity-fit
								className="text-muted-foreground text-xs uppercase tracking-[0.14em]"
							>
								{designSystem.preview.intendedFit}
							</p>
							<ArrowUpRight
								className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								aria-hidden="true"
							/>
						</Link>
					</DesignSystemPreviewTheme>
				</li>
			))}
		</ul>
	);
}

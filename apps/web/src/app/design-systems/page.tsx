import type { Metadata, Route } from "next";
import Link from "next/link";

import { DesignSystemBrowser } from "@/components/design-system-browser";
import { designSystemDiscoveryFor, designSystems } from "@/lib/catalog";
import { publicOrigin, StructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
	title: "Design Systems | AgentKogei",
	description:
		"Browse Published Design Systems from AgentKogei and choose a direction for your Project.",
	alternates: {
		canonical: "/design-systems",
	},
};

export default function DesignSystemsPage() {
	const browserDesignSystems = designSystems.map(designSystemDiscoveryFor);
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		"@id": `${publicOrigin}/design-systems#published-design-systems`,
		name: "AgentKogei Design Systems",
		url: `${publicOrigin}/design-systems`,
		itemListElement: designSystems.map((designSystem, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "CreativeWork",
				"@id": `${publicOrigin}${designSystem.preview.route}#design-system`,
				name: `${designSystem.name} Design System`,
				url: `${publicOrigin}${designSystem.preview.route}`,
			},
		})),
	};

	return (
		<main>
			<StructuredData identity="design-systems" data={structuredData} />
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-end">
					<div className="flex flex-col gap-5">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Design Systems / Launch collection
						</p>
						<h1 className="font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
							Published systems. Distinct voices.
						</h1>
					</div>
					<div className="flex max-w-xl flex-col gap-4">
						<p className="text-lg text-muted-foreground leading-8">
							Every Published Design System meets the same completeness,
							accessibility, and Design System Evaluation standard. Choose the
							direction that fits your Project.
						</p>
						<Link
							href={"/guides/design-md" as Route}
							className="w-fit font-medium text-sm underline underline-offset-4"
						>
							Learn how Design Contracts direct agent work
						</Link>
					</div>
				</div>
			</header>

			<section
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-label="Published Design Systems"
			>
				<div className="mx-auto max-w-7xl">
					<DesignSystemBrowser designSystems={browserDesignSystems} />
				</div>
			</section>
		</main>
	);
}

import type { Metadata } from "next";

import { DesignSystemCard } from "@/components/design-system-card";
import { designSystems } from "@/lib/catalog";

export const metadata: Metadata = {
	title: "Design Systems | AgentKogei",
	description:
		"Browse Published Design Systems from AgentKogei and choose a direction for your Project.",
};

export default function DesignSystemsPage() {
	return (
		<main>
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
					<p className="max-w-xl text-lg text-muted-foreground leading-8">
						Every Published Design System meets the same completeness,
						accessibility, and Design System Evaluation standard. Choose the
						direction that fits your Project.
					</p>
				</div>
			</header>

			<section
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-label="Published Design Systems"
			>
				<div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
					{designSystems.map((designSystem, index) => (
						<DesignSystemCard
							key={designSystem.slug}
							designSystem={designSystem}
							index={index}
						/>
					))}
				</div>
			</section>
		</main>
	);
}

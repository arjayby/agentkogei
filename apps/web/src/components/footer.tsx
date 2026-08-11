import type { Route } from "next";
import Link from "next/link";

import { designSystems } from "@/lib/catalog";

const productLinks = [
	{ href: "/design-systems" as Route, label: "Design Systems" },
] as const;

const repositoryUrl = "https://github.com/arjayby/agentkogei";

export default function Footer() {
	return (
		<footer className="border-t px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
			<div className="mx-auto flex max-w-7xl flex-col gap-12">
				<div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-16">
					<div className="flex max-w-sm flex-col gap-4">
						<Link href="/" className="font-medium tracking-tight">
							AgentKogei
						</Link>
						<p className="text-muted-foreground text-sm leading-6">
							Complete design systems for coding agents. One visual direction
							across every screen.
						</p>
					</div>
					<nav aria-label="Design Systems" className="flex flex-col gap-3">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							Design Systems
						</p>
						{designSystems.map((designSystem) => (
							<Link
								key={designSystem.slug}
								href={designSystem.preview.route as Route}
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								{designSystem.name}
							</Link>
						))}
					</nav>
					<nav aria-label="Product" className="flex flex-col gap-3">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							Product
						</p>
						{productLinks.map(({ href, label }) => (
							<Link
								key={href}
								href={href}
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								{label}
							</Link>
						))}
						<a
							href={repositoryUrl}
							rel="noreferrer"
							target="_blank"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							GitHub
						</a>
					</nav>
				</div>
			</div>
		</footer>
	);
}

import type { Route } from "next";
import Link from "next/link";

import { designPacks } from "@/lib/catalog";

const productLinks = [
	{ href: "/catalog" as Route, label: "Catalog" },
	{ href: "/docs" as Route, label: "Docs" },
	{ href: "/premium" as Route, label: "Premium" },
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
							Durable, versioned design direction for coding agents. One
							interface system across every screen of a Project.
						</p>
					</div>
					<nav aria-label="Design Packs" className="flex flex-col gap-3">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							Design Packs
						</p>
						{designPacks.map((pack) => (
							<Link
								key={pack.slug}
								href={`/catalog/${pack.slug}` as Route}
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								{pack.name}
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
				<div className="flex flex-col gap-2 border-t pt-6 text-muted-foreground text-xs leading-5">
					<p>
						The AgentKogei application, API, CLI, Design Pack specification, and
						validators are MIT licensed. Open Design Packs are CC BY 4.0;
						Premium Design Pack resources use a commercial Pack License.
					</p>
					<p>© {new Date().getFullYear()} AgentKogei</p>
				</div>
			</div>
		</footer>
	);
}

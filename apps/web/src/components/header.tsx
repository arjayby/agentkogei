import type { Route } from "next";
import Link from "next/link";

import BuilderAccountMenu from "./builder-account-menu";
import { ModeToggle } from "./mode-toggle";

const navigation = [
	{ href: "/catalog" as Route, label: "Catalog" },
	{ href: "/pricing" as Route, label: "Pricing" },
	{ href: "/docs" as Route, label: "Docs" },
] as const;

export default function Header() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto grid h-14 max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:gap-4 sm:px-8">
				<Link
					href="/"
					className="font-medium tracking-tight"
					aria-label="AgentKogei home"
				>
					<span className="sm:hidden">AK</span>
					<span className="hidden sm:inline">AgentKogei</span>
				</Link>
				<nav
					aria-label="Primary navigation"
					className="flex justify-center gap-3 text-sm sm:gap-7"
				>
					{navigation.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							{label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<BuilderAccountMenu />
				</div>
			</div>
		</header>
	);
}

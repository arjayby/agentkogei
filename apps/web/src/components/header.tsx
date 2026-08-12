import { buttonVariants } from "@agentkogei/ui/components/button";
import type { Route } from "next";
import Link from "next/link";

import { BrandMark } from "./brand-mark";
import { ModeToggle } from "./mode-toggle";

const navigation = [
	{ href: "/design-systems" as Route, label: "Design Systems" },
] as const;

const repositoryUrl = "https://github.com/arjayby/agentkogei";

export default function Header() {
	return (
		<header className="site-header sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto grid h-14 max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:gap-4 sm:px-8">
				<Link
					href="/"
					className="site-brand flex items-center gap-2 font-medium tracking-tight"
					aria-label="AgentKogei home"
				>
					<span className="site-brand-mark">
						<BrandMark className="size-7" />
					</span>
					<span className="site-brand-wordmark">AgentKogei</span>
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
					<a
						href={repositoryUrl}
						target="_blank"
						rel="noreferrer"
						className={buttonVariants({ variant: "outline", size: "icon" })}
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M12 .297a12 12 0 0 0-3.79 23.388c.6.113.82-.258.82-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.386-1.332-1.755-1.332-1.755-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.932 0-1.31.465-2.381 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .317.21.694.825.576A12 12 0 0 0 12 .297" />
						</svg>
						<span className="sr-only">GitHub repository</span>
					</a>
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}

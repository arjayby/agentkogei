"use client";

import { track } from "@vercel/analytics";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export function DesignContractLink({
	children,
	className,
	designSystem,
	href,
	surface,
}: {
	children: ReactNode;
	className?: string;
	designSystem: string;
	href: Route;
	surface: "guide" | "preview";
}) {
	return (
		<Link
			href={href}
			className={className}
			onClick={() => {
				track("Design Contract Opened", { designSystem, surface });
			}}
		>
			{children}
		</Link>
	);
}

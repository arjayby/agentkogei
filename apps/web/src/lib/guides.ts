import { publicOrigin } from "@/lib/structured-data";

export const designContractGuide = {
	route: "/guides/design-md",
	title: "Design Contracts for AI coding agents",
	description:
		"Learn how Project instructions and a root Design Contract give AI coding agents durable visual direction that remains available offline.",
	publishedAt: "2026-08-13",
} as const;

export const designContractGuideUrl = `${publicOrigin}${designContractGuide.route}`;

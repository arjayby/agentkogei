import { publicOrigin } from "@/lib/structured-data";

export const designContractGuide = {
	route: "/guides/design-md",
	title: "Design Contracts for AI coding agents",
	description:
		"Learn how Project instructions and a root Design Contract give AI coding agents durable visual direction that remains available offline.",
	publishedAt: "2026-08-13",
} as const;

export const designContractGuideUrl = `${publicOrigin}${designContractGuide.route}`;

export const consistentAiUiGuide = {
	route: "/guides/consistent-ai-ui",
	title: "How to keep AI generated interfaces consistent",
	description:
		"Learn why plausible AI generated screens drift and how to evaluate durable Design System direction before Installation.",
	publishedAt: "2026-08-13",
} as const;

export const consistentAiUiGuideUrl = `${publicOrigin}${consistentAiUiGuide.route}`;

import type { Metadata } from "next";
import { agentKogeiOrganization, publicOrigin } from "@/lib/structured-data";

type Guide = {
	route: `/guides/${string}`;
	title: string;
	description: string;
	publishedAt: string;
	card: {
		label: string;
		title: string;
		body: string;
		linkLabel: string;
	};
};

export const designContractGuide = {
	route: "/guides/design-md",
	title: "Design Contracts for AI coding agents",
	description:
		"Learn how Project instructions and a root Design Contract give AI coding agents durable visual direction that remains available offline.",
	publishedAt: "2026-08-13",
	card: {
		label: "Design Contract / Vendor neutral",
		title: "Durable visual direction for every agent.",
		body: "Learn how Project instructions lead agents to one root Design Contract, why the Installed Design System remains available offline, and how Installation prepares future work.",
		linkLabel: "Read the Design Contract guide",
	},
} as const satisfies Guide;

export const codexGuide = {
	route: "/guides/codex",
	title: "Use a Design System with Codex",
	description:
		"Install one Design Contract, inspect the managed Project instruction, and verify the direction Codex receives before interface work.",
	publishedAt: "2026-08-13",
	card: {
		label: "Codex / Project instructions",
		title: "Make your Design Contract discoverable to Codex.",
		body: "Follow the tested Installation workflow, inspect the managed AGENTS.md reference, and verify the direction Codex receives before interface work.",
		linkLabel: "Read the Codex guide",
	},
} as const satisfies Guide;

export const claudeCodeGuide = {
	route: "/guides/claude-code",
	title: "Claude Code Design Contract workflow",
	description:
		"Connect Claude Code through Project instructions to one root Design Contract, then inspect and verify the complete workflow.",
	publishedAt: "2026-08-13",
	card: {
		label: "Claude Code / Explicit bridge",
		title: "Connect Claude Code to durable direction.",
		body: "Add one explicit import so Claude Code reads the same Project instructions and root Design Contract as every other coding agent.",
		linkLabel: "Read the Claude Code guide",
	},
} as const satisfies Guide;

export const guides = [
	codexGuide,
	designContractGuide,
	claudeCodeGuide,
] as const;

export const guidesPublishedAt = guides.reduce<string>(
	(latest, guide) => (guide.publishedAt > latest ? guide.publishedAt : latest),
	guides[0].publishedAt,
);

export function guideUrl(guide: Guide) {
	return `${publicOrigin}${guide.route}`;
}

export function guideMetadata(guide: Guide): Metadata {
	return {
		title: `${guide.title} | AgentKogei`,
		description: guide.description,
		alternates: {
			canonical: guide.route,
		},
	};
}

export function guideStructuredData(guide: Guide) {
	const url = guideUrl(guide);
	return {
		"@context": "https://schema.org",
		"@type": "TechArticle",
		"@id": `${url}#article`,
		headline: guide.title,
		description: guide.description,
		url,
		mainEntityOfPage: url,
		inLanguage: "en",
		datePublished: guide.publishedAt,
		dateModified: guide.publishedAt,
		author: agentKogeiOrganization,
		publisher: {
			"@id": agentKogeiOrganization["@id"],
		},
	};
}

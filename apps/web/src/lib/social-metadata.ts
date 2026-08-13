import type { Metadata } from "next";

import { currentRelease, type DesignSystem } from "@/lib/catalog";
import { homepageDescription, publicOrigin } from "@/lib/structured-data";

export type SocialCardDefinition = {
	canonicalPath: `/${string}`;
	title: string;
	heading: string;
	description: string;
	eyebrow: string;
	imagePath?: `/${string}`;
	visualIdentity?: {
		identity: string;
		release: string;
		markRecipe: DesignSystem["preview"]["mark"]["recipe"];
		background: string;
		foreground: string;
		primary: string;
		primaryForeground: string;
	};
};

type GuideSocialSource = {
	route: `/guides/${string}`;
	title: string;
	description: string;
	card: {
		label: string;
	};
};

export const homepageSocialCard = {
	canonicalPath: "/",
	title: "Give your agents better taste | AgentKogei",
	heading: "Give your agents better taste.",
	description: homepageDescription,
	eyebrow: "Complete design systems for coding agents",
} as const satisfies SocialCardDefinition;

export const guidesSocialCard = {
	canonicalPath: "/guides",
	title: "Guides for AI coding agents | AgentKogei",
	heading: "Guides for durable agent direction.",
	description:
		"Practical guides for giving AI coding agents durable Design System direction across a Project.",
	eyebrow: "AgentKogei Guides",
} as const satisfies SocialCardDefinition;

export const methodologySocialCard = {
	canonicalPath: "/methodology",
	title: "Design System Evaluation methodology | AgentKogei",
	heading: "Design System Evaluation methodology",
	description:
		"How AgentKogei authors, evaluates, publishes, versions, licenses, retrieves, and installs Design Systems.",
	eyebrow: "Trust and evidence",
} as const satisfies SocialCardDefinition;

export const designSystemsSocialCard = {
	canonicalPath: "/design-systems",
	title: "Design Systems | AgentKogei",
	heading: "Published systems. Distinct voices.",
	description:
		"Browse Published Design Systems from AgentKogei and choose a direction for your Project.",
	eyebrow: "Published Design Systems",
} as const satisfies SocialCardDefinition;

export function guideSocialCard(
	guide: GuideSocialSource,
): SocialCardDefinition {
	return {
		canonicalPath: guide.route,
		title: `${guide.title} | AgentKogei`,
		heading: guide.title,
		description: guide.description,
		eyebrow: guide.card.label,
	};
}

export function designSystemSocialCard(
	designSystem: DesignSystem,
): SocialCardDefinition {
	const release = currentRelease(designSystem);
	const { background, foreground, primary, primaryForeground } =
		designSystem.preview.theme.tokens.light;

	return {
		canonicalPath: designSystem.preview.route as `/${string}`,
		title: `${designSystem.name} Design System Preview | AgentKogei`,
		heading: `${designSystem.name} Design System`,
		description: `${designSystem.name} Design System: ${designSystem.preview.summary}`,
		eyebrow: `Design System Release ${release.version}`,
		imagePath: `/social/design-systems/${designSystem.slug}/${release.version}`,
		visualIdentity: {
			identity: designSystem.slug,
			release: release.version,
			markRecipe: designSystem.preview.mark.recipe,
			background,
			foreground,
			primary,
			primaryForeground,
		},
	};
}

export function socialImagePath(card: SocialCardDefinition) {
	if (card.imagePath) return card.imagePath;
	return card.canonicalPath === "/"
		? "/social/home"
		: `/social${card.canonicalPath}`;
}

export function canonicalUrl(card: SocialCardDefinition) {
	return `${publicOrigin}${
		card.canonicalPath === "/" ? "" : card.canonicalPath
	}`;
}

export function socialMetadata(card: SocialCardDefinition): Metadata {
	const pageUrl = canonicalUrl(card);
	const imageUrl = `${publicOrigin}${socialImagePath(card)}`;
	const imageAlt = `${card.title} social preview`;

	return {
		title: card.title,
		description: card.description,
		alternates: {
			canonical: card.canonicalPath,
		},
		openGraph: {
			title: card.title,
			description: card.description,
			url: pageUrl,
			siteName: "AgentKogei",
			locale: "en_US",
			type: "website",
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: imageAlt,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: card.title,
			description: card.description,
			images: [
				{
					url: imageUrl,
					alt: imageAlt,
				},
			],
		},
	};
}

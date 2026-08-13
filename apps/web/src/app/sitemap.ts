import type { MetadataRoute } from "next";

import { currentRelease, designSystems } from "@/lib/catalog";
import {
	codexGuide,
	codexGuideUrl,
	designContractGuide,
	designContractGuideUrl,
} from "@/lib/guides";
import { publicOrigin } from "@/lib/structured-data";

const methodologyPublishedAt = "2026-08-13";

export default function sitemap(): MetadataRoute.Sitemap {
	const previews = designSystems.map((designSystem) => ({
		url: `${publicOrigin}${designSystem.preview.route}`,
		lastModified: currentRelease(designSystem).publishedAt,
	}));
	const collectionLastModified = previews
		.map(({ lastModified }) => lastModified)
		.toSorted()
		.at(-1);

	if (!collectionLastModified) {
		throw new Error(
			"The Design Systems collection has no Published Design Systems",
		);
	}

	return [
		{
			url: publicOrigin,
			lastModified: collectionLastModified,
		},
		{
			url: `${publicOrigin}/design-systems`,
			lastModified: collectionLastModified,
		},
		{
			url: `${publicOrigin}/guides`,
			lastModified: codexGuide.publishedAt,
		},
		{
			url: codexGuideUrl,
			lastModified: codexGuide.publishedAt,
		},
		{
			url: designContractGuideUrl,
			lastModified: designContractGuide.publishedAt,
		},
		{
			url: `${publicOrigin}/methodology`,
			lastModified: methodologyPublishedAt,
		},
		...previews,
	];
}

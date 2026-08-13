import type { MetadataRoute } from "next";

import { currentRelease, designSystems } from "@/lib/catalog";
import { guides, guidesPublishedAt, guideUrl } from "@/lib/guides";
import { publicOrigin } from "@/lib/structured-data";

const methodologyPublishedAt = "2026-08-13";

export default function sitemap(): MetadataRoute.Sitemap {
	const previews = designSystems.map((designSystem) => ({
		url: `${publicOrigin}${designSystem.preview.route}`,
		lastModified: currentRelease(designSystem).publishedAt,
	}));
	const guidePages = guides.map((guide) => ({
		url: guideUrl(guide),
		lastModified: guide.publishedAt,
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
			lastModified: guidesPublishedAt,
		},
		...guidePages,
		{
			url: `${publicOrigin}/methodology`,
			lastModified: methodologyPublishedAt,
		},
		...previews,
	];
}

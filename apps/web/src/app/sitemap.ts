import type { MetadataRoute } from "next";

import { currentRelease, designSystems } from "@/lib/catalog";
import { publicOrigin } from "@/lib/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
	const previews = designSystems.map((designSystem) => ({
		url: `${publicOrigin}${designSystem.preview.route}`,
		lastModified: currentRelease(designSystem).publishedAt,
	}));
	const catalogLastModified = previews
		.map(({ lastModified }) => lastModified)
		.toSorted()
		.at(-1);

	if (!catalogLastModified) {
		throw new Error(
			"The Design Systems collection has no Published Design Systems",
		);
	}

	return [
		{
			url: publicOrigin,
			lastModified: catalogLastModified,
		},
		{
			url: `${publicOrigin}/design-systems`,
			lastModified: catalogLastModified,
		},
		...previews,
	];
}

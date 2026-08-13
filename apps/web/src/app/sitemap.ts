import type { MetadataRoute } from "next";
import { designSystems } from "@/lib/catalog";
import { designContractGuide, designContractGuideUrl } from "@/lib/guides";
import { publicOrigin } from "@/lib/structured-data";

const canonicalPages = ["", "/design-systems", "/guides"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		...canonicalPages.map((route) => ({
			url: `${publicOrigin}${route}`,
		})),
		{
			url: designContractGuideUrl,
			lastModified: new Date(
				`${designContractGuide.publishedAt}T00:00:00.000Z`,
			),
		},
		...designSystems.map((designSystem) => ({
			url: `${publicOrigin}${designSystem.preview.route}`,
		})),
	];
}

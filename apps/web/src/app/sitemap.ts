import type { MetadataRoute } from "next";
import { designSystems } from "@/lib/catalog";
import { publicOrigin } from "@/lib/structured-data";

const canonicalPages = ["", "/design-systems", "/guides"] as const;
const guideModifiedAt = new Date("2026-08-13T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		...canonicalPages.map((route) => ({
			url: `${publicOrigin}${route}`,
		})),
		{
			url: `${publicOrigin}/guides/design-md`,
			lastModified: guideModifiedAt,
		},
		...designSystems.map((designSystem) => ({
			url: `${publicOrigin}${designSystem.preview.route}`,
		})),
	];
}

import type { MetadataRoute } from "next";

import { currentRelease, designSystems } from "@/lib/catalog";
import { publicOrigin } from "@/lib/structured-data";

const publicContentModifiedAt = "2026-08-13";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: publicOrigin,
			lastModified: publicContentModifiedAt,
		},
		{
			url: `${publicOrigin}/design-systems`,
			lastModified: publicContentModifiedAt,
		},
		{
			url: `${publicOrigin}/methodology`,
			lastModified: publicContentModifiedAt,
		},
		...designSystems.map((designSystem) => ({
			url: `${publicOrigin}${designSystem.preview.route}`,
			lastModified: currentRelease(designSystem).publishedAt,
		})),
	];
}

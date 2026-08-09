import { readDesignContract } from "./design-contract";
import { discoverPublishedDesignSystems } from "./published-design-systems";

/**
 * Generates the two public application artifacts from the same validated
 * Published Design System source. Catalog presentation uses current metadata,
 * while delivery retains every exact Design System Release.
 */
export async function generateOfficialCatalogArtifacts(
	releasesDirectory: string,
) {
	const publishedDesignSystems =
		await discoverPublishedDesignSystems(releasesDirectory);
	const catalogDesignSystems = [];
	const deliveryEntries = [];

	for (const designSystem of publishedDesignSystems) {
		const current = designSystem.releases.at(-1);
		if (!current) {
			throw new Error(
				`${designSystem.id} has no current Design System Release`,
			);
		}

		catalogDesignSystems.push({
			id: designSystem.id,
			name: current.metadata.designSystem,
			currentRelease: current.version,
			preview: current.metadata.preview,
			compatibility: current.metadata.compatibility,
			evaluation: current.metadata.evaluation,
			releases: designSystem.releases
				.toReversed()
				.map(({ metadata, version }) => ({
					version,
					publishedAt: metadata.designSystemRelease.publishedAt,
					changelog: metadata.changelog,
				})),
		});

		const releaseEntries = await Promise.all(
			designSystem.releases.map(async ({ directory, version }) => {
				const contract = await readDesignContract(directory);
				return [version, contract] as const;
			}),
		);
		deliveryEntries.push([
			designSystem.id,
			{
				currentRelease: current.version,
				releases: Object.fromEntries(releaseEntries),
			},
		] as const);
	}

	return {
		catalog: {
			schemaVersion: "1.0" as const,
			designSystems: catalogDesignSystems,
		},
		designContracts: Object.fromEntries(deliveryEntries),
	};
}

import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	comparePackReleaseVersions,
	type PackReleaseVersion,
	packReleaseVersionSchema,
} from "./release-version";

export {
	buildDesignContract,
	type DesignContract,
} from "./design-contract";
export {
	applyDesignContractInstallation,
	type DesignContractInstallationPlan,
	formatDesignContractDiff,
	formatDesignContractPreview,
	planDesignContractInstallation,
	retrieveDesignContract,
} from "./design-contract-installation";
export {
	applyInstallation,
	discardInstallationPlan,
	formatInstallationPreview,
	type InstallationPlan,
	prepareInstallation,
} from "./installation";
export {
	applyUpdate,
	detachInstalledPack,
	discardUpdatePlan,
	discoverUpdate,
	formatDetachPreview,
	formatInstalledPackStatus,
	formatUpdatePreview,
	type InstalledPackRecord,
	type InstalledPackStatus,
	inspectInstalledPack,
	type UpdatePlan,
} from "./lifecycle";
export { type PackManifest, packManifestSchema } from "./manifest";
export type { PackRegistryItem } from "./registry";
export {
	comparePackReleaseVersions,
	type PackReleaseVersion,
	packReleaseVersionSchema,
	type SemanticLevel,
	semanticLevelBetween,
} from "./release-version";
export {
	type PackValidationOptions,
	type PackValidationResult,
	validatePackRelease,
} from "./validator";

function createPublishedPack(
	id: string,
	description: (manifest: import("./manifest").PackManifest) => string,
) {
	const releasesDirectory = fileURLToPath(
		new URL(`../releases/${id}`, import.meta.url),
	);
	const versions = readdirSync(releasesDirectory, {
		withFileTypes: true,
	}).flatMap((entry) => {
		const version = packReleaseVersionSchema.safeParse(entry.name);
		return entry.isDirectory() && version.success ? [version.data] : [];
	});
	versions.sort(comparePackReleaseVersions);
	const catalogVersion = versions.at(-1);
	if (!catalogVersion) {
		throw new Error(`${id} has no Pack Releases`);
	}
	function directoryFor(version: PackReleaseVersion) {
		if (!versions.includes(version)) {
			throw new Error(`Unknown ${id} Pack Release ${version}`);
		}
		return path.join(releasesDirectory, version);
	}
	return {
		id,
		versions,
		directory: directoryFor(catalogVersion),
		directoryFor,
		async buildRegistryItem(releaseDirectory = directoryFor(catalogVersion)) {
			const { buildPackRegistryItem } = await import("./registry");
			return buildPackRegistryItem(releaseDirectory, description);
		},
	};
}

const foundation = createPublishedPack(
	"foundation",
	(manifest) =>
		`${manifest.name} ${manifest.release.version}: a complete, neutral, crisp, highly legible B2B Interface System.`,
);
const editorial = createPublishedPack(
	"editorial",
	(manifest) =>
		`${manifest.name} ${manifest.release.version}: ${manifest.preview.summary}`,
);

export const publishedPacks = [foundation, editorial] as const;

export function foundationReleaseDirectoryFor(version: PackReleaseVersion) {
	return foundation.directoryFor(version);
}

export const foundationReleaseVersions = foundation.versions;
export const foundationReleaseDirectory = foundation.directory;

export function editorialReleaseDirectoryFor(version: PackReleaseVersion) {
	return editorial.directoryFor(version);
}

export const editorialReleaseVersions = editorial.versions;
export const editorialReleaseDirectory = editorial.directory;

export async function buildFoundationRegistryItem(
	releaseDirectory = foundationReleaseDirectory,
) {
	return foundation.buildRegistryItem(releaseDirectory);
}

export async function buildEditorialRegistryItem(
	releaseDirectory = editorialReleaseDirectory,
) {
	return editorial.buildRegistryItem(releaseDirectory);
}

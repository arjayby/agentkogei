import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	comparePackReleaseVersions,
	type PackReleaseVersion,
	packReleaseVersionSchema,
} from "./release-version";

export {
	applyInstallation,
	discardInstallationPlan,
	formatInstallationPreview,
	type InstallationPlan,
	prepareInstallation,
} from "./installation";
export {
	applyUpdate,
	discardUpdatePlan,
	discoverUpdate,
	formatInstalledPackStatus,
	formatUpdatePreview,
	type InstalledPackRecord,
	type InstalledPackStatus,
	inspectInstalledPack,
	type UpdatePlan,
} from "./lifecycle";
export { type PackManifest, packManifestSchema } from "./manifest";
export type { FoundationRegistryItem } from "./registry";
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

const foundationReleasesDirectory = fileURLToPath(
	new URL("../releases/foundation", import.meta.url),
);

export const foundationReleaseVersions = readdirSync(
	foundationReleasesDirectory,
	{ withFileTypes: true },
).flatMap((entry) => {
	const version = packReleaseVersionSchema.safeParse(entry.name);
	return entry.isDirectory() && version.success ? [version.data] : [];
});
foundationReleaseVersions.sort(comparePackReleaseVersions);

const catalogFoundationVersion = foundationReleaseVersions.at(-1);
if (!catalogFoundationVersion) {
	throw new Error("Foundation has no Pack Releases");
}

export function foundationReleaseDirectoryFor(version: PackReleaseVersion) {
	if (!foundationReleaseVersions.includes(version)) {
		throw new Error(`Unknown Foundation Pack Release ${version}`);
	}
	return path.join(foundationReleasesDirectory, version);
}

export const foundationReleaseDirectory = foundationReleaseDirectoryFor(
	catalogFoundationVersion,
);

export async function buildFoundationRegistryItem(
	releaseDirectory = foundationReleaseDirectory,
) {
	const { buildFoundationRegistryItem: build } = await import("./registry");
	return build(releaseDirectory);
}

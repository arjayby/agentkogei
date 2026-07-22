import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	comparePackReleaseVersions,
	type PackReleaseVersion,
	packReleaseVersionSchema,
} from "./release-version";

export {
	type DesignContract,
	designContractSchema,
	readDesignContract,
} from "./design-contract";
export {
	applyDesignContractInstallation,
	type DesignContractInstallationPlan,
	formatDesignContractDiff,
	formatDesignContractPreview,
	PackCredentialRequiredError,
	PremiumAccessRequiredError,
	planDesignContractInstallation,
	retrieveDesignContract,
} from "./design-contract-installation";
export {
	designContractFileName,
	type PackEvaluationRecord,
	packEvaluationFileName,
	packEvaluationRecordSchema,
} from "./pack-evaluation";
export {
	comparePackReleaseVersions,
	type PackReleaseVersion,
	packReleaseVersionSchema,
} from "./release-version";
export {
	type PackValidationOptions,
	type PackValidationResult,
	validatePackRelease,
} from "./validator";

function createPublishedPack(id: string) {
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
	};
}

const foundation = createPublishedPack("foundation");
const editorial = createPublishedPack("editorial");

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

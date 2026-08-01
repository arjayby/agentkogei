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
	designContractFileName,
	designContractSchema,
	readDesignContract,
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
	type PackEvaluationRecord,
	packAccessSchema,
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
const mono = createPublishedPack("mono");
const command = createPublishedPack("command");

export const publishedPacks = [foundation, editorial, mono, command] as const;

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

export function monoReleaseDirectoryFor(version: PackReleaseVersion) {
	return mono.directoryFor(version);
}

export const monoReleaseVersions = mono.versions;
export const monoReleaseDirectory = mono.directory;

export function commandReleaseDirectoryFor(version: PackReleaseVersion) {
	return command.directoryFor(version);
}

export const commandReleaseVersions = command.versions;
export const commandReleaseDirectory = command.directory;

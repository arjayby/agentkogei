import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	compareDesignSystemReleaseVersions,
	type DesignSystemReleaseVersion,
	designSystemReleaseVersionSchema,
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
	type DesignSystemEvaluationRecord,
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "./design-system-evaluation";
export {
	compareDesignSystemReleaseVersions,
	type DesignSystemReleaseVersion,
	designSystemReleaseVersionSchema,
} from "./release-version";
export {
	type DesignSystemValidationOptions,
	type DesignSystemValidationResult,
	validateDesignSystemRelease,
} from "./validator";

function createPublishedDesignSystem(id: string) {
	const releasesDirectory = fileURLToPath(
		new URL(`../releases/${id}`, import.meta.url),
	);
	const versions = readdirSync(releasesDirectory, {
		withFileTypes: true,
	}).flatMap((entry) => {
		const version = designSystemReleaseVersionSchema.safeParse(entry.name);
		return entry.isDirectory() && version.success ? [version.data] : [];
	});
	versions.sort(compareDesignSystemReleaseVersions);
	const catalogVersion = versions.at(-1);
	if (!catalogVersion) {
		throw new Error(`${id} has no Design System Releases`);
	}
	function directoryFor(version: DesignSystemReleaseVersion) {
		if (!versions.includes(version)) {
			throw new Error(`Unknown ${id} Design System Release ${version}`);
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

const foundation = createPublishedDesignSystem("foundation");
const editorial = createPublishedDesignSystem("editorial");
const mono = createPublishedDesignSystem("mono");
const command = createPublishedDesignSystem("command");

export const publishedDesignSystems = [
	foundation,
	editorial,
	mono,
	command,
] as const;

export function foundationReleaseDirectoryFor(
	version: DesignSystemReleaseVersion,
) {
	return foundation.directoryFor(version);
}

export const foundationReleaseVersions = foundation.versions;
export const foundationReleaseDirectory = foundation.directory;

export function editorialReleaseDirectoryFor(
	version: DesignSystemReleaseVersion,
) {
	return editorial.directoryFor(version);
}

export const editorialReleaseVersions = editorial.versions;
export const editorialReleaseDirectory = editorial.directory;

export function monoReleaseDirectoryFor(version: DesignSystemReleaseVersion) {
	return mono.directoryFor(version);
}

export const monoReleaseVersions = mono.versions;
export const monoReleaseDirectory = mono.directory;

export function commandReleaseDirectoryFor(
	version: DesignSystemReleaseVersion,
) {
	return command.directoryFor(version);
}

export const commandReleaseVersions = command.versions;
export const commandReleaseDirectory = command.directory;

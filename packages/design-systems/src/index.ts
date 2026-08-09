import { fileURLToPath } from "node:url";
import {
	type DesignSystemIdentity,
	designSystemIdentitySchema,
} from "./design-system-identity";
import { discoverPublishedDesignSystems } from "./published-design-systems";
import type { DesignSystemReleaseVersion } from "./release-version";

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
	designSystemPreviewSurfaces,
} from "./design-system-evaluation";
export type { DesignSystemIdentity } from "./design-system-identity";
export { generateOfficialCatalogArtifacts } from "./official-catalog-generation";
export {
	discoverPublishedDesignSystems,
	type PublishedDesignSystem,
	type PublishedDesignSystemRelease,
} from "./published-design-systems";
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

const releasesDirectory = fileURLToPath(
	new URL("../releases", import.meta.url),
);

export const publishedDesignSystems =
	await discoverPublishedDesignSystems(releasesDirectory);

function publishedDesignSystem(identity: DesignSystemIdentity) {
	const designSystem = publishedDesignSystems.find(
		(candidate) => candidate.id === identity,
	);
	if (!designSystem) {
		throw new Error(`${identity} is not a Published Design System`);
	}
	return designSystem;
}

const foundation = publishedDesignSystem(
	designSystemIdentitySchema.parse("foundation"),
);
const editorial = publishedDesignSystem(
	designSystemIdentitySchema.parse("editorial"),
);
const mono = publishedDesignSystem(designSystemIdentitySchema.parse("mono"));
const command = publishedDesignSystem(
	designSystemIdentitySchema.parse("command"),
);

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

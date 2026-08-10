import {
	type DesignSystemIdentity,
	type DesignSystemReleaseVersion,
	publishedDesignSystems,
} from "../../src/index";

export function publishedReleaseDirectory(
	identity: DesignSystemIdentity,
	version?: DesignSystemReleaseVersion,
) {
	const designSystem = publishedDesignSystems.find(
		(candidate) => candidate.id === identity,
	);
	if (!designSystem) {
		throw new Error(`${identity} is not a Published Design System`);
	}
	return version ? designSystem.directoryFor(version) : designSystem.directory;
}

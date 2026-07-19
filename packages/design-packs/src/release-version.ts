import { z } from "zod";

export type PackReleaseVersion = `${number}.${number}.${number}`;
export type SemanticLevel = "major" | "minor" | "patch";

const packReleaseVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const packReleaseVersionSchema = z.custom<PackReleaseVersion>(
	(value) => typeof value === "string" && packReleaseVersionPattern.test(value),
	{ message: "must be a semantic Pack Release version" },
);

function components(version: PackReleaseVersion) {
	return version.split(".").map(Number) as [number, number, number];
}

export function comparePackReleaseVersions(
	left: PackReleaseVersion,
	right: PackReleaseVersion,
) {
	const leftComponents = components(left);
	const rightComponents = components(right);
	for (let index = 0; index < 3; index += 1) {
		const difference =
			(leftComponents[index] ?? 0) - (rightComponents[index] ?? 0);
		if (difference !== 0) {
			return difference;
		}
	}
	return 0;
}

export function semanticLevelBetween(
	current: PackReleaseVersion,
	proposed: PackReleaseVersion,
): SemanticLevel | undefined {
	const currentComponents = components(current);
	const proposedComponents = components(proposed);
	for (const [index, level] of ["major", "minor", "patch"].entries()) {
		const difference =
			(proposedComponents[index] ?? 0) - (currentComponents[index] ?? 0);
		if (difference > 0) {
			return level as SemanticLevel;
		}
		if (difference < 0) {
			return undefined;
		}
	}
	return undefined;
}

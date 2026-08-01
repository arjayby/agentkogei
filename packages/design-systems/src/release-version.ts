import { z } from "zod";

export type DesignSystemReleaseVersion = `${number}.${number}.${number}`;

const designSystemReleaseVersionPattern =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const designSystemReleaseVersionSchema =
	z.custom<DesignSystemReleaseVersion>(
		(value) =>
			typeof value === "string" &&
			designSystemReleaseVersionPattern.test(value),
		{ message: "must be a semantic Design System Release version" },
	);

function components(version: DesignSystemReleaseVersion) {
	return version.split(".").map(Number) as [number, number, number];
}

export function compareDesignSystemReleaseVersions(
	left: DesignSystemReleaseVersion,
	right: DesignSystemReleaseVersion,
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

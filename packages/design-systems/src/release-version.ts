import { z } from "zod";

export type DesignSystemReleaseVersion = `${number}.${number}`;

const designSystemReleaseVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const designSystemReleaseVersionSchema =
	z.custom<DesignSystemReleaseVersion>(
		(value) =>
			typeof value === "string" &&
			designSystemReleaseVersionPattern.test(value),
		{ message: "must be a two part Design System Release version" },
	);

function components(version: DesignSystemReleaseVersion) {
	return version.split(".").map(BigInt) as [bigint, bigint];
}

export function compareDesignSystemReleaseVersions(
	left: DesignSystemReleaseVersion,
	right: DesignSystemReleaseVersion,
) {
	const leftComponents = components(left);
	const rightComponents = components(right);
	for (let index = 0; index < 2; index += 1) {
		const leftComponent = leftComponents[index] ?? BigInt(0);
		const rightComponent = rightComponents[index] ?? BigInt(0);
		if (leftComponent < rightComponent) return -1;
		if (leftComponent > rightComponent) return 1;
	}
	return 0;
}

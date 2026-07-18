#!/usr/bin/env bun

import { validatePackRelease } from "./validator";

const arguments_ = process.argv.slice(2);
const rootDirectory = arguments_[0];
const publishedOptionIndex = arguments_.indexOf("--published");
const publishedReleaseDirectory =
	publishedOptionIndex === -1
		? undefined
		: arguments_[publishedOptionIndex + 1];

if (
	!rootDirectory ||
	(publishedOptionIndex !== -1 && !publishedReleaseDirectory)
) {
	console.error(
		"Usage: agentkogei-validate-pack <release-directory> [--published <release-directory>]",
	);
	process.exit(2);
}

const result = await validatePackRelease(rootDirectory, {
	publishedReleaseDirectory,
});
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

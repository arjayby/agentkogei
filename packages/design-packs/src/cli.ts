#!/usr/bin/env bun

/**
 * Official Catalog publication validation. It stays repository tooling rather
 * than a published executable, because AgentKogei validates its own packs and
 * offers no author SDK.
 */

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
		"Usage: bun run validate <release-directory> [--published <release-directory>]",
	);
	process.exit(2);
}

const result = await validatePackRelease(rootDirectory, {
	publishedReleaseDirectory,
});
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

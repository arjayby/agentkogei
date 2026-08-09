#!/usr/bin/env bun

import path from "node:path";

import { validateCandidateDesignSystemRelease } from "../../../../packages/design-systems/src/candidate-design-system";

const arguments_ = process.argv.slice(2);
const rootDirectory = arguments_[0];

function option(name: string) {
	const index = arguments_.indexOf(name);
	return index === -1 ? undefined : arguments_[index + 1];
}

if (!rootDirectory) {
	console.error(
		"Usage: bun validate-candidate.ts <candidate-directory> [--candidates <directory>] [--published <directory>]",
	);
	process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "../../../..");
const result = await validateCandidateDesignSystemRelease(rootDirectory, {
	candidatesDirectory:
		option("--candidates") ??
		path.join(projectRoot, "packages/design-systems/candidates"),
	publishedReleasesDirectory:
		option("--published") ??
		path.join(projectRoot, "packages/design-systems/releases"),
});

console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

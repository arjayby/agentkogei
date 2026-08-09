#!/usr/bin/env bun

import { mkdir, rename, rmdir } from "node:fs/promises";
import path from "node:path";

import { validateCandidateDesignSystemRelease } from "../../../../packages/design-systems/src/candidate-design-system";

const arguments_ = process.argv.slice(2);
const stagedDirectory = arguments_[0];

function option(name: string) {
	const index = arguments_.indexOf(name);
	return index === -1 ? undefined : arguments_[index + 1];
}

const candidatesDirectory = option("--candidates");
const publishedReleasesDirectory = option("--published");

if (!stagedDirectory || !candidatesDirectory || !publishedReleasesDirectory) {
	console.error(
		"Usage: bun create-candidate.ts <staged-directory> --candidates <directory> --published <directory>",
	);
	process.exit(2);
}

const validation = await validateCandidateDesignSystemRelease(stagedDirectory, {
	candidatesDirectory,
	publishedReleasesDirectory,
});
if (!validation.ok) {
	console.log(JSON.stringify(validation));
	process.exit(1);
}
if (validation.authoringApproval !== "pending") {
	console.log(
		JSON.stringify({
			ok: false,
			errors: ["candidate creation requires pending Authoring Approval"],
		}),
	);
	process.exit(1);
}

const identityDirectory = path.join(candidatesDirectory, validation.identity);
const candidateDirectory = path.join(identityDirectory, validation.version);

try {
	await mkdir(candidatesDirectory, { recursive: true });
	await mkdir(identityDirectory);
	try {
		await rename(stagedDirectory, candidateDirectory);
	} catch (error) {
		await rmdir(identityDirectory).catch(() => undefined);
		throw error;
	}
} catch (_error) {
	console.log(
		JSON.stringify({
			ok: false,
			errors: [
				`candidate target already exists or cannot be created: ${candidateDirectory}`,
			],
		}),
	);
	process.exit(1);
}

console.log(JSON.stringify({ ok: true, candidateDirectory }));

#!/usr/bin/env bun

import path from "node:path";

import { promoteApprovedPublication } from "../../../../packages/design-systems/src/publication-release";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const proposalDirectory = command.primary;
const approvalFile = command.option("--approval");
if (!proposalDirectory || !approvalFile) {
	console.error(
		"Usage: bun promote-publication.ts <proposal-directory> --approval <file> [--repository <directory>]",
	);
	process.exit(2);
}

const result = await promoteApprovedPublication({
	proposalDirectory,
	approvalFile,
	repository: path.resolve(
		command.option("--repository") ??
			path.resolve(import.meta.dirname, "../../../.."),
	),
});
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

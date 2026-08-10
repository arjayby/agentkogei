#!/usr/bin/env bun

import path from "node:path";

import { preparePublicationProposal } from "../../../../packages/design-systems/src/publication-workflow";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const evaluationProject = command.primary;
const candidateDirectory = command.option("--candidate");
const proposalDirectory = command.option("--proposal");
const metadataFile = command.option("--metadata");
if (
	!evaluationProject ||
	!candidateDirectory ||
	!proposalDirectory ||
	!metadataFile
) {
	console.error(
		"Usage: bun prepare-publication.ts <evaluation-project> --candidate <directory> --proposal <directory> --metadata <file> [--published <directory>]",
	);
	process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "../../../..");
const result = await preparePublicationProposal(
	evaluationProject,
	candidateDirectory,
	proposalDirectory,
	metadataFile,
	command.option("--published") ??
		path.join(projectRoot, "packages/design-systems/releases"),
);
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

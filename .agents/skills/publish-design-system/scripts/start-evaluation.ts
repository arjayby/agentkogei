#!/usr/bin/env bun

import path from "node:path";

import { startPublicationEvaluation } from "../../../../packages/design-systems/src/publication-workflow";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const candidateDirectory = command.primary;
const evaluationProject = command.option("--project");
if (!candidateDirectory || !evaluationProject) {
	console.error(
		"Usage: bun start-evaluation.ts <candidate-directory> --project <isolated-project> [--published <directory>]",
	);
	process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "../../../..");
const result = await startPublicationEvaluation(
	candidateDirectory,
	evaluationProject,
	command.option("--published") ??
		path.join(projectRoot, "packages/design-systems/releases"),
);

console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

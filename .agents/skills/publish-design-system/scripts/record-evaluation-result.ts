#!/usr/bin/env bun

import {
	type EvaluationResultKind,
	type EvaluationResultStatus,
	recordPublicationEvaluationResult,
} from "../../../../packages/design-systems/src/publication-workflow";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const evaluationProject = command.primary;
const kind = command.option("--kind") as EvaluationResultKind | undefined;
const id = command.option("--id");
const status = command.option("--status") as EvaluationResultStatus | undefined;
const evidence = command.option("--evidence");
if (
	!evaluationProject ||
	!kind ||
	!id ||
	!status ||
	!evidence ||
	!["agent-run", "automated-check"].includes(kind) ||
	!["passed", "failed"].includes(status)
) {
	console.error(
		"Usage: bun record-evaluation-result.ts <evaluation-project> --kind <agent-run|automated-check> --id <id> --status <passed|failed> --evidence <relative-path>",
	);
	process.exit(2);
}

const result = await recordPublicationEvaluationResult(
	evaluationProject,
	kind,
	id,
	status,
	evidence,
);
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

#!/usr/bin/env bun

import {
	approvePublicationHumanReview,
	type HumanReviewKind,
} from "../../../../packages/design-systems/src/publication-workflow";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const evaluationProject = command.primary;
const review = command.option("--review") as HumanReviewKind | undefined;
const reviewedAt = command.option("--reviewed-at");
const evidence = command.option("--evidence");
if (
	!evaluationProject ||
	!review ||
	!reviewedAt ||
	!evidence ||
	!["visual", "accessibility", "rights"].includes(review)
) {
	console.error(
		"Usage: bun approve-human-review.ts <evaluation-project> --review <visual|accessibility|rights> --reviewed-at <timestamp> --evidence <relative-path> --assert <assertion>...",
	);
	process.exit(2);
}

const result = await approvePublicationHumanReview(
	evaluationProject,
	review,
	reviewedAt,
	evidence,
	command.options("--assert"),
);
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

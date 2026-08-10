#!/usr/bin/env bun

import { recordPublicationApproval } from "../../../../packages/design-systems/src/publication-release";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const proposalDirectory = command.primary;
const verificationFile = command.option("--verification");
const approvalFile = command.option("--approval");
const approvedAt = command.option("--approved-at");
const approvedBy = command.option("--approved-by");
if (
	!proposalDirectory ||
	!verificationFile ||
	!approvalFile ||
	!approvedAt ||
	!approvedBy
) {
	console.error(
		"Usage: bun approve-publication.ts <proposal-directory> --verification <file> --approval <file> --approved-at <timestamp> --approved-by <maintainer-identifier> --assert <assertion>...",
	);
	process.exit(2);
}

const result = await recordPublicationApproval({
	proposalDirectory,
	verificationFile,
	approvalFile,
	approvedAt,
	approvedBy,
	assertions: command.options("--assert"),
});
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

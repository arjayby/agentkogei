#!/usr/bin/env bun

import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	candidateMetadataFileName,
	validateCandidateDesignSystemRelease,
} from "../../../../packages/design-systems/src/candidate-design-system";

const arguments_ = process.argv.slice(2);
const candidateDirectory = arguments_[0];
const approvedAtIndex = arguments_.indexOf("--approved-at");
const approvedAt =
	approvedAtIndex === -1 ? undefined : arguments_[approvedAtIndex + 1];

if (!candidateDirectory || !approvedAt) {
	console.error(
		"Usage: bun record-authoring-approval.ts <candidate-directory> --approved-at <ISO-8601 timestamp>",
	);
	process.exit(2);
}

const approvalDate = new Date(approvedAt);
if (
	Number.isNaN(approvalDate.valueOf()) ||
	!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(approvedAt)
) {
	console.log(
		JSON.stringify({
			ok: false,
			errors: ["approved-at must be an ISO-8601 UTC timestamp"],
		}),
	);
	process.exit(1);
}

const projectRoot = path.resolve(import.meta.dirname, "../../../..");
const validationOptions = {
	candidatesDirectory: path.join(
		projectRoot,
		"packages/design-systems/candidates",
	),
	publishedReleasesDirectory: path.join(
		projectRoot,
		"packages/design-systems/releases",
	),
};
const validateCandidate = () =>
	validateCandidateDesignSystemRelease(candidateDirectory, validationOptions);

const validation = await validateCandidate();
if (!validation.ok) {
	console.log(JSON.stringify(validation));
	process.exit(1);
}

const metadataPath = path.join(candidateDirectory, candidateMetadataFileName);
const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as {
	authoringApproval: { status: string; recordedAt: string | null };
};
if (metadata.authoringApproval.status !== "pending") {
	console.log(
		JSON.stringify({
			ok: false,
			errors: ["Authoring Approval has already been recorded"],
		}),
	);
	process.exit(1);
}

metadata.authoringApproval = { status: "approved", recordedAt: approvedAt };
const temporaryPath = `${metadataPath}.approval-${process.pid}`;
await writeFile(temporaryPath, `${JSON.stringify(metadata, null, "\t")}\n`, {
	flag: "wx",
});
await rename(temporaryPath, metadataPath);

const approvedValidation = await validateCandidate();
if (!approvedValidation.ok) {
	console.log(JSON.stringify(approvedValidation));
	process.exit(1);
}

console.log(
	JSON.stringify({
		ok: true,
		authoringApproval: "approved",
		recordedAt: approvedAt,
		evaluationStatus: "pending",
		publicationApproval: "pending",
	}),
);

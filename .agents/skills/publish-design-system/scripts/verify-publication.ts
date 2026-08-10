#!/usr/bin/env bun

import { cp, lstat, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "../../../../packages/design-systems/src/design-system-evaluation";
import {
	contractRetrievalProtocol,
	inspectPublicationProposal,
	verifyContractRetrievalProtocol,
} from "../../../../packages/design-systems/src/publication-release";
import { validateDesignSystemRelease } from "../../../../packages/design-systems/src/validator";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const proposalDirectory = command.primary;

if (!proposalDirectory) {
	console.error(
		"Usage: bun verify-publication.ts <proposal-directory> [--repository <directory>] [--output <verification-file>]",
	);
	process.exit(2);
}

const repository = path.resolve(
	command.option("--repository") ??
		path.resolve(import.meta.dirname, "../../../.."),
);
const repositoryStatus = Bun.spawnSync(
	["git", "status", "--porcelain", "--untracked-files=all"],
	{ cwd: repository },
);
if (
	repositoryStatus.exitCode !== 0 ||
	repositoryStatus.stdout.toString().trim().length > 0
) {
	console.log(
		JSON.stringify({
			ok: false,
			errors: ["repository must be clean before publication verification"],
		}),
	);
	process.exit(1);
}
const protocol = await verifyContractRetrievalProtocol(repository);
if (!protocol.ok) {
	console.log(JSON.stringify(protocol));
	process.exit(1);
}
const validation = await validateDesignSystemRelease(proposalDirectory);
if (!validation.ok) {
	console.log(JSON.stringify(validation));
	process.exit(1);
}
const record = designSystemEvaluationRecordSchema.parse(
	JSON.parse(
		await readFile(
			path.join(proposalDirectory, designSystemEvaluationFileName),
			"utf8",
		),
	),
);
const productionRelativePath = path.join(
	"packages/design-systems/releases",
	record.id,
	record.designSystemRelease.version,
);
try {
	await lstat(path.join(repository, productionRelativePath));
	console.log(
		JSON.stringify({
			ok: false,
			errors: [`production target already exists: ${productionRelativePath}`],
		}),
	);
	process.exit(1);
} catch {
	// An absent production target is required for proposal verification.
}

const worktree = await mkdtemp(path.join(tmpdir(), "agentkogei-verify-"));

async function run(command: string[], cwd: string, inherit = false) {
	const process_ = Bun.spawn(command, {
		cwd,
		stdout: inherit ? "inherit" : "pipe",
		stderr: inherit ? "inherit" : "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		process_.exited,
		inherit ? Promise.resolve("") : new Response(process_.stdout).text(),
		inherit ? Promise.resolve("") : new Response(process_.stderr).text(),
	]);
	return { exitCode, stdout, stderr };
}

let addedWorktree = false;
try {
	const added = await run(
		["git", "worktree", "add", "--detach", worktree, "HEAD"],
		repository,
	);
	if (added.exitCode !== 0) {
		throw new Error(
			`could not create verification worktree: ${added.stderr.trim()}`,
		);
	}
	addedWorktree = true;
	const installed = await run(
		["bun", "install", "--frozen-lockfile"],
		worktree,
	);
	if (installed.exitCode !== 0) {
		throw new Error(
			`could not install verification dependencies: ${installed.stderr.trim()}`,
		);
	}
	await cp(proposalDirectory, path.join(worktree, productionRelativePath), {
		recursive: true,
		errorOnExist: true,
	});
	const verified = await run(["bun", "run", "launch:verify"], worktree, true);
	if (verified.exitCode !== 0) {
		throw new Error(
			"launch:verify failed with the proposed release integrated",
		);
	}
	const [proposal, head] = await Promise.all([
		inspectPublicationProposal(proposalDirectory),
		run(["git", "rev-parse", "HEAD"], repository),
	]);
	if (!proposal.ok) {
		throw new Error(proposal.errors.join("; "));
	}
	if (head.exitCode !== 0) {
		throw new Error(
			`could not resolve verified repository commit: ${head.stderr.trim()}`,
		);
	}
	const result = {
		ok: true,
		schemaVersion: "1.0",
		identity: record.id,
		version: record.designSystemRelease.version,
		designContractSha256: record.designContract.sha256,
		proposalFiles: proposal.files,
		repositoryHead: head.stdout.trim(),
		contractRetrievalProtocol,
		launchVerify: "passed",
		productionMutated: false,
	};
	const output = command.option("--output");
	if (output) {
		await writeFile(output, `${JSON.stringify(result, null, "\t")}\n`, {
			flag: "wx",
		});
	}
	console.log(JSON.stringify(result));
} catch (error) {
	console.log(
		JSON.stringify({
			ok: false,
			errors: [
				error instanceof Error ? error.message : "proposal verification failed",
			],
		}),
	);
	process.exitCode = 1;
} finally {
	if (addedWorktree) {
		await run(["git", "worktree", "remove", "--force", worktree], repository);
	}
}

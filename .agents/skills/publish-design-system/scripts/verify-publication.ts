#!/usr/bin/env bun

import { cp, lstat, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "../../../../packages/design-systems/src/design-system-evaluation";
import { validateDesignSystemRelease } from "../../../../packages/design-systems/src/validator";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const proposalDirectory = command.primary;

if (!proposalDirectory) {
	console.error(
		"Usage: bun verify-publication.ts <proposal-directory> [--repository <directory>]",
	);
	process.exit(2);
}

const repository = path.resolve(
	command.option("--repository") ??
		path.resolve(import.meta.dirname, "../../../.."),
);
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
	console.log(
		JSON.stringify({
			ok: true,
			identity: record.id,
			version: record.designSystemRelease.version,
			designContractSha256: record.designContract.sha256,
			launchVerify: "passed",
			productionMutated: false,
		}),
	);
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

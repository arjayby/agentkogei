#!/usr/bin/env bun

import path from "node:path";

import { verifyProductionPublication } from "../../../../packages/design-systems/src/publication-release";
import { commandArguments } from "./command-arguments";

const command = commandArguments(process.argv.slice(2));
const approvalFile = command.primary;
const productionUrl = command.option("--production-url");
if (!approvalFile || !productionUrl) {
	console.error(
		"Usage: bun verify-production.ts <approval-file> --production-url <url> [--repository <directory>] [--cli-package <tarball>]",
	);
	process.exit(2);
}

const repository = path.resolve(
	command.option("--repository") ??
		path.resolve(import.meta.dirname, "../../../.."),
);
const result = await verifyProductionPublication({
	approvalFile,
	repository,
	productionUrl,
	cliPackage:
		command.option("--cli-package") ??
		path.join(
			repository,
			"packages/design-systems/.distribution/agentkogei.tgz",
		),
});
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);

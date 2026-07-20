import path from "node:path";

export const cliPath = path.resolve(
	process.cwd(),
	process.env.AGENTKOGEI_CLI_PATH ??
		"../../packages/design-packs/src/install-cli.ts",
);

import { spawn } from "node:child_process";
import path from "node:path";

export const cliPath = path.resolve(
	process.cwd(),
	process.env.AGENTKOGEI_CLI_PATH ??
		"../../packages/design-packs/src/install-cli.ts",
);

/**
 * Runs the distributed CLI as a real subprocess, the way a Builder does, so
 * these journeys observe only its terminal output and exit code.
 */
export async function runCli(
	arguments_: string[],
	{
		cwd,
		environment = {},
	}: { cwd?: string; environment?: Record<string, string> } = {},
) {
	const process_ = spawn("bun", [cliPath, ...arguments_], {
		...(cwd ? { cwd } : {}),
		env: { ...process.env, ...environment },
	});
	let stdout = "";
	let stderr = "";
	process_.stdout.setEncoding("utf8");
	process_.stderr.setEncoding("utf8");
	process_.stdout.on("data", (chunk: string) => {
		stdout += chunk;
	});
	process_.stderr.on("data", (chunk: string) => {
		stderr += chunk;
	});
	const exitCode = await new Promise<number | null>((resolve, reject) => {
		process_.once("error", reject);
		process_.once("close", resolve);
	});
	return { exitCode, stdout, stderr };
}

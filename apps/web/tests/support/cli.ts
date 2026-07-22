import { spawn } from "node:child_process";
import path from "node:path";

/**
 * The built `agentkogei` executable. It is plain Node.js output, so the black
 * box always launches it the way a Builder's package runner does.
 */
export const cliPath = path.resolve(
	process.cwd(),
	process.env.AGENTKOGEI_CLI_PATH ??
		"../../packages/design-packs/dist/agentkogei.js",
);

/**
 * Runs a real subprocess and collects only what a Builder sees: standard
 * output, standard error, and the exit code.
 */
export async function runProcess(
	command: string,
	arguments_: string[],
	{
		cwd,
		environment = {},
	}: { cwd?: string; environment?: Record<string, string> } = {},
) {
	const process_ = spawn(command, arguments_, {
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

/**
 * Runs the distributed CLI as a real subprocess, the way a Builder does, so
 * these journeys observe only its terminal output and exit code.
 */
export function runCli(
	arguments_: string[],
	options: { cwd?: string; environment?: Record<string, string> } = {},
) {
	return runProcess("node", [cliPath, ...arguments_], options);
}

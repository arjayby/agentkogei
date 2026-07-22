import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

function spawnToCompletion(command: string, arguments_: string[], cwd: string) {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(command, arguments_, { cwd, stdio: "inherit" });
		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${command} exited with status ${code}`));
		});
	});
}

const packageDirectory = path.resolve(import.meta.dir, "..");

/**
 * Where the publishable tarball lands. The black-box harness expects this path,
 * so the CLI its runner matrix exercises is the artifact `npm publish` would
 * upload rather than the TypeScript sources.
 */
const tarballPath = path.join(packageDirectory, ".distribution/agentkogei.tgz");

/**
 * `bun pm pack` resolves the workspace catalog protocol the way a publish
 * would, so the packed manifest is the one Builders receive.
 */
async function packCli() {
	await rm(path.dirname(tarballPath), { recursive: true, force: true });
	await mkdir(path.dirname(tarballPath), { recursive: true });
	await spawnToCompletion(
		"bun",
		["pm", "pack", "--filename", tarballPath],
		packageDirectory,
	);
	return tarballPath;
}

console.log(await packCli());

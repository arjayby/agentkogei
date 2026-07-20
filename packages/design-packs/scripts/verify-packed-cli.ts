import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

function run(command: string, arguments_: string[], cwd: string) {
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
const temporaryDirectory = await mkdtemp(
	path.join(tmpdir(), "agentkogei-packed-cli-"),
);

try {
	const tarball = path.join(temporaryDirectory, "agentkogei.tgz");
	await run("bun", ["pm", "pack", "--filename", tarball], packageDirectory);
	await writeFile(
		path.join(temporaryDirectory, "package.json"),
		JSON.stringify({
			private: true,
			dependencies: { "@agentkogei/design-packs": `file:${tarball}` },
		}),
	);
	await run("bun", ["install"], temporaryDirectory);

	const executableDirectory = path.join(
		temporaryDirectory,
		"node_modules/.bin",
	);
	await run(
		path.join(executableDirectory, "agentkogei"),
		["diagnostics", "status"],
		temporaryDirectory,
	);
	await run(
		path.join(executableDirectory, "agentkogei-validate-pack"),
		[path.join(packageDirectory, "releases/foundation/1.0.0")],
		temporaryDirectory,
	);
	console.log("Installed tarball exposes both declared CLI executables.");
} finally {
	await rm(temporaryDirectory, { recursive: true, force: true });
}

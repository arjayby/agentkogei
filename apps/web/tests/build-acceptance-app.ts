import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const webDirectory = path.resolve(import.meta.dirname, "..");
const projectDirectory = path.resolve(webDirectory, "../..");
const publishedReleasesDirectory = path.join(
	projectDirectory,
	"packages/design-systems/releases",
);
const additionalReleasesDirectory = path.join(
	projectDirectory,
	"packages/design-systems/tests/fixtures/releases",
);
const acceptanceReleasesDirectory = await mkdtemp(
	path.join(tmpdir(), "agentkogei-acceptance-releases-"),
);

async function run(
	command: string[],
	environment: Record<string, string> = {},
) {
	const [executable, ...arguments_] = command;
	if (!executable) {
		throw new Error("Acceptance build command is empty");
	}
	const process_ = spawn(executable, arguments_, {
		cwd: webDirectory,
		env: { ...process.env, ...environment },
		stdio: "inherit",
	});
	const exitCode = await new Promise<number | null>((resolve, reject) => {
		process_.once("error", reject);
		process_.once("close", resolve);
	});
	if (exitCode !== 0) {
		throw new Error(`${command.join(" ")} exited with ${exitCode}`);
	}
}

try {
	await cp(publishedReleasesDirectory, acceptanceReleasesDirectory, {
		recursive: true,
	});
	await cp(additionalReleasesDirectory, acceptanceReleasesDirectory, {
		recursive: true,
		force: false,
		errorOnExist: true,
	});
	await run(["bun", "run", "build"], {
		AGENTKOGEI_RELEASES_DIRECTORY: acceptanceReleasesDirectory,
	});
} finally {
	try {
		await run(["bun", "run", "contracts:build"]);
	} finally {
		await rm(acceptanceReleasesDirectory, { recursive: true, force: true });
	}
}

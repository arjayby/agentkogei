import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const buildDirectory =
	process.env.NEXT_TEST_BUILD === "true" ? ".next-test" : ".next";
const roots = [path.resolve(buildDirectory)];

/**
 * Every byte of every gated Design Contract the build has been provisioned
 * with. Each protected Pack Release is the raw Markdown a Project installs, so
 * the whole document is the marker that must not reach a build artifact.
 */
function protectedMarkers() {
	const markers: Buffer[] = [];
	for (const variable of [
		"COMMAND_PREMIUM_RELEASE",
		"SIGNAL_PREMIUM_RELEASE",
	] as const) {
		const serialized = process.env[variable];
		if (!serialized) continue;
		try {
			const release = JSON.parse(serialized) as { markdown?: string };
			if (release.markdown) markers.push(Buffer.from(release.markdown));
		} catch {
			throw new Error(`${variable} is not valid JSON`);
		}
	}
	return markers;
}

const gatedMarkers = protectedMarkers();

async function filesBelow(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	return (
		await Promise.all(
			entries.map(async (entry) => {
				const target = path.join(directory, entry.name);
				if (entry.isDirectory()) return filesBelow(target);
				if (entry.isFile() && !(await lstat(target)).isSymbolicLink()) {
					return [target];
				}
				return [];
			}),
		)
	).flat();
}

if (gatedMarkers.length === 0) {
	console.log(
		"Skipped: this build was provisioned with no protected Pack Release.",
	);
	process.exit(0);
}

const leakedFiles: string[] = [];
for (const root of roots) {
	for (const file of await filesBelow(root)) {
		const contents = await readFile(file);
		if (gatedMarkers.some((marker) => contents.includes(marker))) {
			leakedFiles.push(file);
		}
	}
}

if (leakedFiles.length > 0) {
	throw new Error(
		`Gated Design Contract bytes appeared in build artifacts:\n${leakedFiles.join("\n")}`,
	);
}

console.log(
	`Verified: ${gatedMarkers.length} gated Design Contracts are absent from build artifacts.`,
);

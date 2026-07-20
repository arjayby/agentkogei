import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const buildDirectory =
	process.env.NEXT_TEST_BUILD === "true" ? ".next-test" : ".next";
const roots = [path.resolve("public"), path.resolve(buildDirectory)];

function protectedMarkers() {
	const markers = [Buffer.from("Controlled Premium Delivery Fixture")];
	for (const variable of [
		"COMMAND_PREMIUM_RELEASE",
		"SIGNAL_PREMIUM_RELEASE",
	] as const) {
		const serialized = process.env[variable];
		if (!serialized) continue;
		try {
			const release = JSON.parse(serialized) as {
				files?: Array<{ content?: string }>;
			};
			for (const file of release.files ?? []) {
				if (file.content) markers.push(Buffer.from(file.content));
			}
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
		`Gated premium fixture bytes appeared in build artifacts:\n${leakedFiles.join("\n")}`,
	);
}

console.log("Verified: gated premium fixture bytes are absent from artifacts.");

import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const buildDirectory =
	process.env.NEXT_TEST_BUILD === "true" ? ".next-test" : ".next";
const buildRoot = path.resolve(buildDirectory);

/**
 * The registry transport AgentKogei retired. A build artifact carrying any of
 * these is still shipping a resource envelope, a declared file tree, or the
 * manifest that described one, rather than the single Design Contract the
 * Official Catalog now delivers.
 */
const retiredTransportMarkers = [
	"registry:item",
	"registry:file",
	"agentkogei.manifest.json",
	"ui.shadcn.com/schema/registry",
];

const forbiddenBytes = retiredTransportMarkers.map((marker) =>
	Buffer.from(marker),
);

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
for (const file of await filesBelow(buildRoot)) {
	const contents = await readFile(file);
	if (forbiddenBytes.some((marker) => contents.includes(marker))) {
		leakedFiles.push(file);
	}
}

if (leakedFiles.length > 0) {
	throw new Error(
		`Retired registry payloads appeared in build artifacts:\n${leakedFiles.join("\n")}`,
	);
}

console.log(
	"Verified: no retired registry payload appears in build artifacts.",
);

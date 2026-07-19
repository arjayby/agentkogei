import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const gatedMarker = Buffer.from("Controlled Premium Delivery Fixture");
const roots = [path.resolve("public"), path.resolve(".next")];

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
		if ((await readFile(file)).includes(gatedMarker)) leakedFiles.push(file);
	}
}

if (leakedFiles.length > 0) {
	throw new Error(
		`Gated premium fixture bytes appeared in build artifacts:\n${leakedFiles.join("\n")}`,
	);
}

console.log("Verified: gated premium fixture bytes are absent from artifacts.");

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { generateOfficialCatalogArtifacts } from "agentkogei/src/official-catalog-generation";

const releasesDirectory = process.env.AGENTKOGEI_RELEASES_DIRECTORY
	? path.resolve(process.env.AGENTKOGEI_RELEASES_DIRECTORY)
	: path.resolve(
			import.meta.dirname,
			"../../../packages/design-systems/releases",
		);
const generatedDirectory = path.resolve(
	import.meta.dirname,
	"../src/generated",
);
const { catalog, designContracts } =
	await generateOfficialCatalogArtifacts(releasesDirectory);
const catalogFile = path.join(generatedDirectory, "official-catalog.json");
const contractsFile = path.join(generatedDirectory, "design-contracts.json");

await mkdir(generatedDirectory, { recursive: true });
await Promise.all([
	writeFile(catalogFile, `${JSON.stringify(catalog, null, "\t")}\n`),
	writeFile(contractsFile, `${JSON.stringify(designContracts, null, "\t")}\n`),
]);

await promisify(execFile)("bunx", [
	"biome",
	"format",
	"--write",
	catalogFile,
	contractsFile,
]);

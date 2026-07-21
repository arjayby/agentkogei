import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildDesignContract, publishedPacks } from "@agentkogei/design-packs";

const outputFile = path.resolve(
	import.meta.dirname,
	"../src/generated/open-design-contracts.json",
);

const catalog = Object.fromEntries(
	await Promise.all(
		publishedPacks.map(async (pack) => {
			const releases = await Promise.all(
				pack.versions.map(async (version) => {
					const contract = await buildDesignContract(
						pack.directoryFor(version),
					);
					if (contract.packRelease !== version) {
						throw new Error(
							`${pack.id} ${version} declares Pack Release ${contract.packRelease}`,
						);
					}
					// This catalog is compiled into the public bundle and served
					// without authentication, so only Open Design Contracts belong in
					// it. A Premium Pack Release must fail the build rather than ship.
					if (contract.access !== "open") {
						throw new Error(
							`${pack.id} ${version} is ${contract.access} and cannot be published as an Open Design Contract`,
						);
					}
					return [version, contract] as const;
				}),
			);
			const currentRelease = pack.versions.at(-1);
			if (!currentRelease) {
				throw new Error(`${pack.id} has no Pack Releases`);
			}
			return [
				pack.id,
				{ currentRelease, releases: Object.fromEntries(releases) },
			] as const;
		}),
	),
);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(catalog, null, "\t")}\n`);

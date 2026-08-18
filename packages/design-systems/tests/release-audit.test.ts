import { describe, expect, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const regressionFile = path.join(
	projectRoot,
	"apps/web/src/release-audit-public-identity-regression.tsx",
);
const activeDocumentationRegressionFile = path.join(
	projectRoot,
	"docs/release-audit-public-language-regression.md",
);
const historicalAdrRegressionFile = path.join(
	projectRoot,
	"docs/adr/9999-release-audit-historical-language-regression.md",
);
const officialCatalogRegressionFile = path.join(
	projectRoot,
	"packages/design-systems/src/release-audit-official-catalog-regression.ts",
);
const publicOfficialCatalogRegressionFile = path.join(
	projectRoot,
	"apps/web/src/release-audit-official-catalog-regression.ts",
);
const rootPackagePath = path.join(projectRoot, "package.json");
const publishedContractPath = path.join(
	projectRoot,
	"packages/design-systems/releases/foundation/1.0/DESIGN.md",
);

async function runReleaseAudit() {
	const process_ = Bun.spawn(["bun", "run", "release:audit"], {
		cwd: projectRoot,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { exitCode, stderr, stdout };
}

async function withTemporaryMutation(
	file: string,
	mutate: (contents: string) => string,
	assertion: () => Promise<void>,
) {
	const originalContents = await readFile(file, "utf8");
	await writeFile(file, mutate(originalContents));
	try {
		await assertion();
	} finally {
		await writeFile(file, originalContents);
	}
}

describe("AgentKogei release audit", () => {
	test("the Project uses one public identity and complete package metadata", async () => {
		const { exitCode, stderr, stdout } = await runReleaseAudit();

		expect(exitCode, stderr).toBe(0);
		expect(stdout).toBe(
			"Release audit passed: public identity and release invariants hold.\n",
		);
	});

	test("stale production identity and public Catalog language fail the audit", async () => {
		const staleProductionUrl = ["https://agentkogei", "dev"].join(".");
		await writeFile(
			regressionFile,
			`export function Regression() { return <p>Browse the public Catalog at ${staleProductionUrl}.</p>; }\n`,
		);
		try {
			const { exitCode, stderr } = await runReleaseAudit();

			expect(exitCode).toBe(1);
			expect(stderr).toContain(
				"apps/web/src/release-audit-public-identity-regression.tsx: stale production domain",
			);
			expect(stderr).toContain(
				"apps/web/src/release-audit-public-identity-regression.tsx: public collection terminology",
			);
		} finally {
			await rm(regressionFile, { force: true });
		}
	});

	test("current documentation rejects public Catalog language while historical ADRs and internal identifiers remain accurate", async () => {
		await Promise.all([
			writeFile(
				activeDocumentationRegressionFile,
				"# Current launch notes\n\nBrowse the public Catalog.\n",
			),
			writeFile(
				historicalAdrRegressionFile,
				"# Historical decision\n\nThe public Catalog was the accepted term.\n",
			),
			writeFile(
				officialCatalogRegressionFile,
				'export const officialCatalogSourceName = "release-source";\n',
			),
			writeFile(
				publicOfficialCatalogRegressionFile,
				'export const heading = "Browse the Official Catalog";\n',
			),
		]);
		try {
			const { exitCode, stderr } = await runReleaseAudit();

			expect(exitCode).toBe(1);
			expect(stderr).toContain(
				"docs/release-audit-public-language-regression.md: public collection terminology",
			);
			expect(stderr).not.toContain(
				"docs/adr/9999-release-audit-historical-language-regression.md",
			);
			expect(stderr).not.toContain(
				"packages/design-systems/src/release-audit-official-catalog-regression.ts",
			);
			expect(stderr).toContain(
				"apps/web/src/release-audit-official-catalog-regression.ts: public collection terminology",
			);
		} finally {
			await Promise.all([
				rm(activeDocumentationRegressionFile, { force: true }),
				rm(historicalAdrRegressionFile, { force: true }),
				rm(officialCatalogRegressionFile, { force: true }),
				rm(publicOfficialCatalogRegressionFile, { force: true }),
			]);
		}
	});

	test("a narrowed launch gate fails the audit", async () => {
		await withTemporaryMutation(
			rootPackagePath,
			(originalPackage) => {
				const packageMetadata = JSON.parse(originalPackage) as {
					scripts: Record<string, string>;
				};
				packageMetadata.scripts["launch:verify"] = "bun run test";
				return `${JSON.stringify(packageMetadata, null, "\t")}\n`;
			},
			async () => {
				const { exitCode, stderr } = await runReleaseAudit();

				expect(exitCode).toBe(1);
				expect(stderr).toContain(
					"package.json: launch:verify must run the complete release gate",
				);
			},
		);
	});

	test("an edited Published Design System Release fails the audit", async () => {
		await withTemporaryMutation(
			publishedContractPath,
			(originalContract) =>
				`${originalContract}\nAccidental post publication edit.\n`,
			async () => {
				const { exitCode, stderr } = await runReleaseAudit();

				expect(exitCode).toBe(1);
				expect(stderr).toContain(
					"packages/design-systems/releases/foundation/1.0/DESIGN.md: immutable release artifact digest does not match",
				);
			},
		);
	});
});

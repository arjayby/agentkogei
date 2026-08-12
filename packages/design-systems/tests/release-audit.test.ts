import { describe, expect, test } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const regressionFile = path.join(
	projectRoot,
	"apps/web/src/release-audit-public-identity-regression.tsx",
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

describe("AgentKogei release audit", () => {
	test("the Project uses one public identity and complete package metadata", async () => {
		const { exitCode, stderr, stdout } = await runReleaseAudit();

		expect(exitCode, stderr).toBe(0);
		expect(stdout).toBe(
			"Release audit passed: public identity and release invariants hold.\n",
		);
	});

	test("stale production identity and public Catalog language fail the audit", async () => {
		await writeFile(
			regressionFile,
			"export function Regression() { return <p>Browse the public Catalog at https://agentkogei.vercel.app or contact team@agentkogei.com.</p>; }\n",
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
});

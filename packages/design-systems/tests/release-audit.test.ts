import { describe, expect, test } from "bun:test";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../..");

describe("stateless Design System release audit", () => {
	test("the tracked Project has no retired commercial or catalog surface", async () => {
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

		expect(exitCode, stderr).toBe(0);
		expect(stdout).toBe(
			"Release audit passed: no retired commercial or catalog surface is tracked.\n",
		);
	});
});

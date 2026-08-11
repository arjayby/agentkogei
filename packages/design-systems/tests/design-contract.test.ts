import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	designContractSchema,
	publishedDesignSystems,
	readDesignContract,
} from "../src/index";
import { publishedReleaseDirectory } from "./support/published-release";

const foundation = () =>
	readDesignContract(publishedReleaseDirectory("foundation", "1.0"));

const publishedReleases = publishedDesignSystems.flatMap((designSystem) =>
	designSystem.versions.map(
		(version) =>
			[
				`${designSystem.id}@${version}`,
				designSystem.directoryFor(version),
			] as const,
	),
);

describe("Design Contract delivery", () => {
	test("reports only the Design System Release metadata and direction", async () => {
		const contract = await foundation();

		expect(contract).toEqual({
			identity: "foundation",
			designSystem: "Foundation",
			designSystemRelease: "1.0",
			markdown: await readFile(
				path.join(publishedReleaseDirectory("foundation", "1.0"), "DESIGN.md"),
				"utf8",
			),
		});
	});

	test("validates the complete Design Contract delivery shape", async () => {
		const contract = await foundation();

		expect(designContractSchema.safeParse(contract).success).toBe(true);
	});

	test("delivers the published Markdown byte for byte", async () => {
		const directory = publishedReleaseDirectory("foundation", "1.0");

		expect((await foundation()).markdown).toBe(
			await readFile(path.join(directory, "DESIGN.md"), "utf8"),
		);
	});

	test("carries the complete direction of the Design System Release", async () => {
		const { markdown } = await foundation();

		expect(markdown).toStartWith("# Foundation Design System\n");
		for (const direction of [
			"Clarity before character.",
			"--foundation-primary: oklch(0.47 0.15 255);",
			"Use one primary action per region.",
			"Good dashboard request",
			"Measure text, control, focus, and meaningful-graphic contrast",
			"Compose existing shadcn/ui primitives before adding custom components.",
		]) {
			expect(markdown).toContain(direction);
		}
	});

	test("presents every part of the direction in one outline", async () => {
		const { markdown } = await foundation();

		for (const heading of [
			"## Foundation component guidance",
			"## Token definitions",
			"## Agent examples",
			"## Foundation validation guidance",
			"## React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction",
		]) {
			expect(markdown).toContain(`\n${heading}\n`);
		}
		expect(markdown).not.toContain("\n# Foundation component guidance");
		expect(markdown).toContain("### Buttons");
	});

	test("refers an AI coding agent to sections rather than to files a Project never receives", async () => {
		const { markdown } = await foundation();

		expect(markdown).toContain(
			"Use semantic roles from the Token definitions section;",
		);
		expect(markdown).toContain(
			"Follow the anatomy in the Foundation component guidance section.",
		);
		expect(markdown).toContain(
			"follows the React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction section and passes the Foundation validation guidance section",
		);
	});

	test("leaves publication evidence out of the direction a Project installs", async () => {
		const { markdown } = await readDesignContract(
			publishedReleaseDirectory("editorial", "1.0"),
		);

		expect(markdown).toContain("# Editorial Design System");
		expect(markdown).not.toContain("evaluation/");
		expect(markdown).not.toContain("agent-generation evidence");
	});

	test("repeatedly delivers the immutable Design System Release", async () => {
		const [current, repeated] = await Promise.all([foundation(), foundation()]);

		expect(current.markdown).toBe(repeated.markdown);
		expect(current.designSystemRelease).toBe("1.0");
	});

	test("refuses an incomplete Design Contract", async () => {
		expect(
			designContractSchema.safeParse({
				identity: "foundation",
				designSystem: "Foundation",
				designSystemRelease: "1.0",
				markdown: "",
			}).success,
		).toBe(false);
	});

	test("refuses a payload carrying anything beside the Design Contract", async () => {
		expect(
			designContractSchema.safeParse({
				...(await foundation()),
				files: [{ path: "DESIGN.md", target: ".agentkogei/foundation" }],
			}).success,
		).toBe(false);
	});
});

describe.each(publishedReleases)(
	"Design Contract %s",
	(selector, directory) => {
		const version = selector.split("@").at(-1);

		test("depends on no separate resource, record, or machine metadata", async () => {
			const { markdown } = await readDesignContract(directory);

			for (const dependency of [
				"tokens.css",
				"components.md",
				"examples.md",
				"validation.md",
				"LICENSE.md",
				"ATTRIBUTION.md",
				"adapters/",
				"evaluation/",
				"design-system-evaluation.json",
				"agentkogei.manifest.json",
				".agentkogei/",
				"sha256",
			]) {
				expect(markdown).not.toContain(dependency);
			}
		});

		test("installs as bare direction with no license or provenance footer", async () => {
			const contract = await readDesignContract(directory);

			expect(contract.designSystemRelease).toBe(version);
			for (const stamp of [
				"## Provenance",
				"## Attribution and provenance",
				"Pack License",
				"Creative Commons",
				"CC BY",
				"licensed under",
			]) {
				expect(contract.markdown).not.toContain(stamp);
			}
			expect(contract.markdown).toEndWith("\n");
		});
	},
);

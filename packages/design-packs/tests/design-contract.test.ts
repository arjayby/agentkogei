import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	designContractSchema,
	editorialReleaseDirectoryFor,
	foundationReleaseDirectoryFor,
	publishedPacks,
	readDesignContract,
} from "../src/index";

const foundation = () =>
	readDesignContract(foundationReleaseDirectoryFor("1.1.0"));

const publishedReleases = publishedPacks.flatMap((pack) =>
	pack.versions.map(
		(version) => [`${pack.id}@${version}`, pack.directoryFor(version)] as const,
	),
);

describe("Design Contract delivery", () => {
	test("reports the Design Pack, Pack Release, and access of the release", async () => {
		const contract = await foundation();

		expect(contract).toMatchObject({
			identity: "foundation",
			designPack: "Foundation",
			packRelease: "1.1.0",
			access: "open",
		});
	});

	test("delivers the published Markdown byte for byte", async () => {
		const directory = foundationReleaseDirectoryFor("1.1.0");

		expect((await foundation()).markdown).toBe(
			await readFile(path.join(directory, "DESIGN.md"), "utf8"),
		);
	});

	test("carries the complete design direction of the Pack Release", async () => {
		const { markdown } = await foundation();

		expect(markdown).toStartWith("# Foundation Interface System\n");
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
			editorialReleaseDirectoryFor("1.0.0"),
		);

		expect(markdown).toContain("# Editorial Interface System");
		expect(markdown).not.toContain("evaluation/");
		expect(markdown).not.toContain("agent-generation evidence");
	});

	test("delivers each Pack Release as its own immutable document", async () => {
		const [current, previous, repeated] = await Promise.all([
			foundation(),
			readDesignContract(foundationReleaseDirectoryFor("1.0.0")),
			foundation(),
		]);

		expect(current.markdown).toBe(repeated.markdown);
		expect(previous.packRelease).toBe("1.0.0");
		expect(previous.markdown).not.toBe(current.markdown);
	});

	test("refuses a release whose Pack Evaluation record is not one", async () => {
		expect(
			designContractSchema.safeParse({
				identity: "foundation",
				designPack: "Foundation",
				packRelease: "1.1.0",
				access: "open",
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
	"Open Design Contract %s",
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
				"pack-evaluation.json",
				"agentkogei.manifest.json",
				".agentkogei/",
				"sha256",
			]) {
				expect(markdown).not.toContain(dependency);
			}
		});

		test("installs as bare direction with no license or provenance footer", async () => {
			const contract = await readDesignContract(directory);

			expect(contract.packRelease).toBe(version);
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

import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	buildDesignContract,
	buildDesignContractFromResources,
	editorialReleaseDirectoryFor,
	foundationReleaseDirectoryFor,
	publishedPacks,
} from "@agentkogei/design-packs";

const foundation = () =>
	buildDesignContract(foundationReleaseDirectoryFor("1.1.0"));

const publishedReleases = publishedPacks.flatMap((pack) =>
	pack.versions.map(
		(version) => [`${pack.id}@${version}`, pack.directoryFor(version)] as const,
	),
);

describe("Design Contract compilation", () => {
	test("reports the Design Pack, Pack Release, Pack License, and access of the release", async () => {
		const contract = await foundation();

		expect(contract).toMatchObject({
			identity: "foundation",
			designPack: "Foundation",
			packRelease: "1.1.0",
			packLicense: "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
			access: "open",
		});
	});

	test("leaves publication evidence out of the direction a Project installs", async () => {
		const { markdown } = await buildDesignContract(
			editorialReleaseDirectoryFor("1.0.0"),
		);

		expect(markdown).toContain("# Editorial Interface System");
		expect(markdown).not.toContain("evaluation/");
		expect(markdown).not.toContain("agent-generation evidence");
	});

	test("carries the complete design direction of every release resource", async () => {
		const { markdown } = await foundation();

		expect(markdown).toStartWith("# Foundation Interface System\n");
		for (const direction of [
			"Clarity before character.",
			"--foundation-primary: oklch(0.47 0.15 255);",
			"Use one primary action per region.",
			"Good dashboard request",
			"Measure text, control, focus, and meaningful-graphic contrast",
			"Compose existing shadcn/ui primitives before adding custom components.",
			"Creative Commons Attribution 4.0 International",
			"All prose, semantic token selections, examples, and evaluation materials",
		]) {
			expect(markdown).toContain(direction);
		}
	});

	test("gives each consolidated resource one section of a single outline", async () => {
		const { markdown } = await foundation();

		for (const heading of [
			"## Foundation component guidance",
			"## Token definitions",
			"## Agent examples",
			"## Foundation validation guidance",
			"## React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter",
		]) {
			expect(markdown).toContain(`\n${heading}\n`);
		}
		expect(markdown).not.toContain("\n# Foundation component guidance");
		expect(markdown).toContain("### Buttons");
	});

	test("resolves cross-references to sections rather than to files a Project never receives", async () => {
		const { markdown } = await foundation();

		expect(markdown).toContain(
			"Use semantic roles from the Token definitions section;",
		);
		expect(markdown).toContain(
			"Follow the anatomy in the Foundation component guidance section.",
		);
		expect(markdown).toContain(
			"follows the React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter section and passes the Foundation validation guidance section",
		);
	});

	test("refuses a release whose direction still points outside the document", async () => {
		const directory = foundationReleaseDirectoryFor("1.1.0");
		const manifest = JSON.parse(
			await readFile(path.join(directory, "agentkogei.manifest.json"), "utf8"),
		) as { files: Array<{ path: string }> };
		const resources = Object.fromEntries(
			await Promise.all(
				["agentkogei.manifest.json", ...manifest.files.map((file) => file.path)]
					.filter((resource) => !resource.startsWith("evaluation/"))
					.map(
						async (resource) =>
							[
								resource,
								await readFile(path.join(directory, resource), "utf8"),
							] as const,
					),
			),
		);

		await expect(
			buildDesignContractFromResources({
				...resources,
				"components.md":
					"# Foundation component guidance\n\nSee validation.md.\n",
			}),
		).rejects.toThrow("foundation 1.1.0 still depends on validation.md");
	});

	test("ends with human-readable provenance and no machine metadata", async () => {
		const { markdown } = await foundation();

		expect(markdown).toContain("\n## Provenance\n");
		expect(markdown).toContain("- Design Pack: Foundation (`foundation`)");
		expect(markdown).toContain("- Pack Release: 1.1.0, published 2026-07-19");
		expect(markdown).toContain(
			"- Pack License: Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		);
		expect(markdown).toContain("licensed under CC BY 4.0");
		expect(markdown).toEndWith("\n");
		expect(markdown).not.toContain("sha256");
		expect(markdown).not.toContain(".agentkogei/");
		expect(markdown).not.toContain("---\n---");
	});

	test("compiles a release held in memory into the same document as its directory", async () => {
		const directory = foundationReleaseDirectoryFor("1.1.0");
		const manifest = JSON.parse(
			await readFile(path.join(directory, "agentkogei.manifest.json"), "utf8"),
		) as { files: Array<{ path: string }> };
		const resources = Object.fromEntries(
			await Promise.all(
				[
					"agentkogei.manifest.json",
					...manifest.files.map((file) => file.path),
				].map(
					async (resource) =>
						[
							resource,
							await readFile(path.join(directory, resource), "utf8"),
						] as const,
				),
			),
		);

		expect(await buildDesignContractFromResources(resources)).toEqual(
			await foundation(),
		);
	});

	test("refuses a release whose declared resources are not all present", async () => {
		const directory = foundationReleaseDirectoryFor("1.1.0");

		await expect(
			buildDesignContractFromResources({
				"agentkogei.manifest.json": await readFile(
					path.join(directory, "agentkogei.manifest.json"),
					"utf8",
				),
			}),
		).rejects.toThrow("missing DESIGN.md");
	});

	test("compiles each Pack Release to its own immutable document", async () => {
		const [current, previous, repeated] = await Promise.all([
			foundation(),
			buildDesignContract(foundationReleaseDirectoryFor("1.0.0")),
			foundation(),
		]);

		expect(current.markdown).toBe(repeated.markdown);
		expect(previous.packRelease).toBe("1.0.0");
		expect(previous.markdown).not.toBe(current.markdown);
	});
});

type DeclaredResource = { path: string; mediaType: string };

/**
 * Picks a substantive line of a release resource that consolidation does not
 * rewrite, so a test can prove the resource's direction reached the document
 * without restating how the compiler assembles it.
 */
async function distinctiveDirection(
	directory: string,
	resource: DeclaredResource,
	resourcePaths: string[],
) {
	const contents = await readFile(path.join(directory, resource.path), "utf8");
	const line = contents
		.split("\n")
		.filter(
			(candidate) =>
				!candidate.startsWith("#") &&
				!resourcePaths.some((resourcePath) => candidate.includes(resourcePath)),
		)
		.sort((a, b) => b.length - a.length)
		.at(0);
	if (!line) throw new Error(`${resource.path} carries no direction`);
	return line;
}

describe.each(publishedReleases)(
	"Open Design Contract %s",
	(selector, directory) => {
		const version = selector.split("@").at(-1);

		test("carries every published resource's direction inside one document", async () => {
			const manifest = JSON.parse(
				await readFile(
					path.join(directory, "agentkogei.manifest.json"),
					"utf8",
				),
			) as { files: DeclaredResource[]; evaluation: { evidence: string } };
			const resourcePaths = manifest.files.map((file) => file.path);
			const consolidated = manifest.files.filter(
				(file) =>
					file.path !== "DESIGN.md" &&
					file.path !== manifest.evaluation.evidence &&
					!file.path.startsWith("evaluation/"),
			);
			const { markdown } = await buildDesignContract(directory);

			expect(consolidated.map((file) => file.path)).toEqual([
				"tokens.css",
				"components.md",
				"adapters/react-tailwind-shadcn/README.md",
				"examples.md",
				"validation.md",
				"LICENSE.md",
				"ATTRIBUTION.md",
			]);
			for (const resource of consolidated) {
				expect(markdown).toContain(
					await distinctiveDirection(directory, resource, resourcePaths),
				);
			}
		});

		test("depends on no separate resource, manifest, or machine metadata", async () => {
			const { markdown } = await buildDesignContract(directory);

			for (const dependency of [
				"tokens.css",
				"components.md",
				"examples.md",
				"validation.md",
				"LICENSE.md",
				"ATTRIBUTION.md",
				"adapters/",
				"evaluation/",
				"agentkogei.manifest.json",
				".agentkogei/",
				"sha256",
			]) {
				expect(markdown).not.toContain(dependency);
			}
		});

		test("ends with human-readable provenance for this exact Pack Release", async () => {
			const contract = await buildDesignContract(directory);
			const provenance = contract.markdown.slice(
				contract.markdown.lastIndexOf("\n## Provenance\n"),
			);

			expect(contract.packRelease).toBe(version);
			expect(provenance).toContain(
				`- Design Pack: ${contract.designPack} (\`${contract.identity}\`)`,
			);
			expect(provenance).toContain(`- Pack Release: ${version}, published `);
			expect(provenance).toContain(`- Pack License: ${contract.packLicense}`);
			expect(provenance).toContain("AgentKogei Official Catalog");
			expect(contract.markdown).toEndWith("\n");
		});
	},
);

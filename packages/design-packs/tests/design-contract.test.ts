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

/** Every resource a Pack Release declares, as the compiler receives them. */
async function releaseResources(directory: string) {
	const manifest = JSON.parse(
		await readFile(path.join(directory, "agentkogei.manifest.json"), "utf8"),
	) as { files: Array<{ path: string }> };
	return Object.fromEntries(
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
}

/**
 * A Pack Release carrying one meaningful graphic, which a Premium Design Pack
 * publishes as part of its direction rather than as publication evidence.
 */
async function releaseWithGraphic(
	graphic: string,
	resourcePath = "resources/momentum-grid.svg",
) {
	const resources = await releaseResources(
		foundationReleaseDirectoryFor("1.1.0"),
	);
	const manifest = JSON.parse(
		resources["agentkogei.manifest.json"] as string,
	) as {
		files: Array<Record<string, string>>;
		provenance: Array<{ paths: string[] }>;
	};
	manifest.files.push({
		path: resourcePath,
		target: `.agentkogei/foundation/${resourcePath}`,
		sha256: "0".repeat(64),
		mediaType: "image/svg+xml",
		mode: "0644",
	});
	(manifest.provenance[0] as { paths: string[] }).paths.push(resourcePath);
	return {
		...resources,
		"agentkogei.manifest.json": JSON.stringify(manifest),
		"DESIGN.md": `${resources["DESIGN.md"]}\nCompose the hero from \`${resourcePath}\`.\n`,
		[resourcePath]: graphic,
	};
}

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
		await expect(
			buildDesignContractFromResources({
				...(await releaseResources(foundationReleaseDirectoryFor("1.1.0"))),
				"components.md":
					"# Foundation component guidance\n\nSee validation.md.\n",
			}),
		).rejects.toThrow("foundation 1.1.0 still depends on validation.md");
	});

	test("carries a meaningful graphic verbatim in the section its own name titles", async () => {
		const { markdown } = await buildDesignContractFromResources(
			await releaseWithGraphic(
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img"><title>Momentum grid</title>\n<path d="M20 145h45V95h45" fill="none" stroke="currentColor" />\n</svg>\n',
			),
		);

		expect(markdown).toContain("\n## Momentum grid\n");
		expect(markdown).toContain("```svg\n");
		expect(markdown).toContain(
			'<path d="M20 145h45V95h45" fill="none" stroke="currentColor" />',
		);
		expect(markdown).toContain(
			"Compose the hero from the Momentum grid section.",
		);
		expect(markdown).not.toContain("resources/momentum-grid.svg");
	});

	test("refuses a graphic with no accessible name to title its section", async () => {
		await expect(
			buildDesignContractFromResources(
				await releaseWithGraphic(
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><path d="M20 145h45V95h45" /></svg>\n',
				),
			),
		).rejects.toThrow(
			"foundation cannot consolidate resources/momentum-grid.svg as image/svg+xml",
		);
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
		expect(
			await buildDesignContractFromResources(
				await releaseResources(foundationReleaseDirectoryFor("1.1.0")),
			),
		).toEqual(await foundation());
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
 * Every line of a release resource that consolidation carries through
 * unchanged. Headings move one level deeper and lines naming a resource are
 * rewritten to name a section, so a test can hold the compiler to the rest
 * without restating how it assembles the document.
 */
async function verbatimDirection(
	directory: string,
	resource: DeclaredResource,
	resourcePaths: string[],
) {
	const contents = await readFile(path.join(directory, resource.path), "utf8");
	const lines = contents
		.split("\n")
		.filter(
			(line) =>
				line.trim() !== "" &&
				!line.startsWith("#") &&
				!resourcePaths.some((resourcePath) => line.includes(resourcePath)),
		);
	if (lines.length === 0)
		throw new Error(`${resource.path} carries no direction`);
	return lines;
}

describe.each(publishedReleases)(
	"Open Design Contract %s",
	(selector, directory) => {
		const version = selector.split("@").at(-1);

		async function declaredResources() {
			const manifest = JSON.parse(
				await readFile(
					path.join(directory, "agentkogei.manifest.json"),
					"utf8",
				),
			) as { files: DeclaredResource[]; evaluation: { evidence: string } };
			return {
				paths: manifest.files.map((file) => file.path),
				consolidated: manifest.files.filter(
					(file) =>
						file.path !== "DESIGN.md" &&
						file.path !== manifest.evaluation.evidence &&
						!file.path.startsWith("evaluation/"),
				),
			};
		}

		test("carries every published resource's direction inside one document", async () => {
			const { paths, consolidated } = await declaredResources();
			const { markdown } = await buildDesignContract(directory);

			// Tokens, component direction, the MVP-stack implementation
			// direction, examples, validation guidance, licensing, and
			// attribution all belong to the single document a Project installs.
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
				for (const line of await verbatimDirection(
					directory,
					resource,
					paths,
				)) {
					expect(markdown).toContain(line);
				}
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

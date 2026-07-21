import { describe, expect, test } from "bun:test";

import {
	buildDesignContract,
	foundationReleaseDirectoryFor,
} from "@agentkogei/design-packs";

const foundation = () =>
	buildDesignContract(foundationReleaseDirectoryFor("1.1.0"));

describe("Design Contract compilation", () => {
	test("reports the Design Pack, Pack Release, and Pack License of the release", async () => {
		const contract = await foundation();

		expect(contract).toMatchObject({
			identity: "foundation",
			designPack: "Foundation",
			packRelease: "1.1.0",
			packLicense: "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		});
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

	test("names each consolidated resource so its cross-references resolve inside the document", async () => {
		const { markdown } = await foundation();

		for (const heading of [
			"## Foundation component guidance (`components.md`)",
			"## Semantic tokens (`tokens.css`)",
			"## Agent examples (`examples.md`)",
			"## Foundation validation guidance (`validation.md`)",
			"## React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter (`adapters/react-tailwind-shadcn/README.md`)",
		]) {
			expect(markdown).toContain(heading);
		}
		expect(markdown).not.toContain("\n# Foundation component guidance");
		expect(markdown).toContain("### Buttons");
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

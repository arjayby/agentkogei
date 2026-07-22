import { describe, expect, test } from "bun:test";

import {
	buildEditorialRegistryItem,
	buildFoundationRegistryItem,
} from "../src/index";

describe("Foundation shadcn-compatible transport", () => {
	test("serializes the immutable Open Pack Release as one complete registry item", async () => {
		const item = await buildFoundationRegistryItem();

		expect(item.$schema).toBe(
			"https://ui.shadcn.com/schema/registry-item.json",
		);
		expect(item.name).toBe("foundation");
		expect(item.type).toBe("registry:item");
		expect(item.files).toHaveLength(10);

		const manifestFile = item.files.find(
			(file) =>
				file.target === ".agentkogei/foundation/agentkogei.manifest.json",
		);
		expect(manifestFile).toBeDefined();
		const manifest = JSON.parse(manifestFile?.content ?? "") as {
			access: string;
			release: { immutable: boolean; version: string };
		};
		expect(manifest).toMatchObject({
			access: "open",
			release: { immutable: true, version: "1.1.0" },
		});

		const designContract = item.files.find(
			(file) => file.target === ".agentkogei/foundation/DESIGN.md",
		);
		expect(designContract?.content).toContain("# Foundation Interface System");
		expect(designContract?.content).toContain("## Final validation checklist");
	});
});

describe("Editorial shadcn-compatible transport", () => {
	test("serializes the distinct immutable Open Pack Release as one complete registry item", async () => {
		const item = await buildEditorialRegistryItem();

		expect(item.$schema).toBe(
			"https://ui.shadcn.com/schema/registry-item.json",
		);
		expect(item.name).toBe("editorial");
		expect(item.type).toBe("registry:item");
		expect(item.files).toHaveLength(11);

		const manifestFile = item.files.find(
			(file) =>
				file.target === ".agentkogei/editorial/agentkogei.manifest.json",
		);
		expect(manifestFile).toBeDefined();
		const manifest = JSON.parse(manifestFile?.content ?? "") as {
			access: string;
			release: { immutable: boolean; version: string };
		};
		expect(manifest).toMatchObject({
			access: "open",
			release: { immutable: true, version: "1.0.0" },
		});

		const designContract = item.files.find(
			(file) => file.target === ".agentkogei/editorial/DESIGN.md",
		);
		expect(designContract?.content).toContain("# Editorial Interface System");
		expect(designContract?.content).toContain("Warmth comes from restraint");
		expect(designContract?.content).toContain("## Final validation checklist");
	});
});

import { describe, expect, test } from "bun:test";

import { buildFoundationRegistryItem } from "@agentkogei/design-packs";

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

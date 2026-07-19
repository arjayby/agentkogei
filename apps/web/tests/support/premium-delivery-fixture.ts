import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

type RegistryFile = {
	path: string;
	type: "registry:file";
	target: string;
	content: string;
};

function sha256(contents: string) {
	return createHash("sha256").update(contents).digest("hex");
}

export function buildTestPremiumDeliveryFixture() {
	const source = JSON.parse(
		readFileSync(path.resolve("public/r/foundation/1.0.0.json"), "utf8"),
	) as {
		name: string;
		title: string;
		description: string;
		files: RegistryFile[];
	};
	const fixture = structuredClone(source);
	fixture.name = "delivery-fixture";
	fixture.title = "Delivery Fixture";
	fixture.description = "Controlled non-catalog fixture for premium delivery.";
	for (const file of fixture.files) {
		file.target = file.target.replace(
			".agentkogei/foundation/",
			".agentkogei/delivery-fixture/",
		);
	}

	const design = fixture.files.find((file) => file.path === "DESIGN.md");
	const license = fixture.files.find((file) => file.path === "LICENSE.md");
	const manifestFile = fixture.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!design || !license || !manifestFile) {
		throw new Error("Foundation test source is incomplete");
	}
	design.content = `# Controlled Premium Delivery Fixture\n\n${design.content}`;
	license.content =
		"# Commercial Pack License\n\nUse is limited to the Project License issued during Installation.\n";

	const manifest = JSON.parse(manifestFile.content) as {
		id: string;
		name: string;
		access: string;
		license: Record<string, string>;
		files: Array<{ path: string; target: string; sha256: string }>;
		provenance: Array<Record<string, unknown>>;
		preview: { summary: string; route: string };
		changelog: { summary: string };
	};
	manifest.id = "delivery-fixture";
	manifest.name = "Delivery Fixture";
	manifest.access = "premium";
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution: "Controlled premium delivery fixture by AgentKogei.",
	};
	manifest.preview = {
		...manifest.preview,
		summary: "Controlled non-catalog fixture for premium delivery.",
		route: "/pricing",
	};
	manifest.changelog.summary = "Initial controlled premium delivery fixture.";
	manifest.provenance = manifest.provenance.map((entry) => ({
		...entry,
		license: "LicenseRef-AgentKogei-Commercial",
		attribution: "Controlled premium delivery fixture by AgentKogei.",
	}));
	for (const declared of manifest.files) {
		declared.target = declared.target.replace(
			".agentkogei/foundation/",
			".agentkogei/delivery-fixture/",
		);
		const transported = fixture.files.find(
			(file) => file.path === declared.path,
		);
		if (!transported) throw new Error(`Missing ${declared.path}`);
		declared.sha256 = sha256(transported.content);
	}
	manifestFile.content = JSON.stringify(manifest, null, 2);
	return JSON.stringify(fixture);
}

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

export function buildTestCommandPackRelease() {
	const source = JSON.parse(
		readFileSync(path.resolve("public/r/foundation/1.0.0.json"), "utf8"),
	) as {
		name: string;
		title: string;
		description: string;
		files: RegistryFile[];
	};
	const release = structuredClone(source);
	release.name = "command";
	release.title = "Command Premium Design Pack";
	release.description =
		"Synthetic protected Command release used only at the premium delivery test boundary.";
	for (const file of release.files) {
		file.target = file.target.replace(
			".agentkogei/foundation/",
			".agentkogei/command/",
		);
	}

	const syntheticResources = [
		{
			path: "patterns/operations.md",
			content:
				"# Synthetic operations patterns\n\nTest-only guidance for dense tables, command palettes, logs, and monitoring states.\n",
		},
		{
			path: "patterns/terminal.md",
			content:
				"# Synthetic terminal patterns\n\nTest-only anatomy for selectable output, status annotations, and keyboard workflows.\n",
		},
		{
			path: "resources/technical-icons.svg",
			content:
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Synthetic technical icon resource</title><path d="M4 12h16M12 4v16" fill="none" stroke="currentColor"/></svg>\n',
		},
	] as const;
	for (const resource of syntheticResources) {
		release.files.push({
			path: resource.path,
			type: "registry:file",
			target: `.agentkogei/command/${resource.path}`,
			content: resource.content,
		});
	}

	const design = release.files.find((file) => file.path === "DESIGN.md");
	const license = release.files.find((file) => file.path === "LICENSE.md");
	const report = release.files.find(
		(file) => file.path === "evaluation/report.json",
	);
	const manifestFile = release.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!design || !license || !report || !manifestFile) {
		throw new Error("Foundation test source is incomplete");
	}
	design.content = `# Command Interface System

This is a synthetic test release, not the commercial Command Design Contract.

## Direction

Use a dark-first, dense, technical interface across marketing, authentication, onboarding, dashboards, tables, forms, settings, and every loading, empty, error, success, disabled, and destructive state.

## Responsive and motion behavior

Preserve hierarchy at mobile widths, keep data reachable without page overflow, and replace non-essential motion when reduced motion is requested.

## Accessibility and agent guidance

Meet WCAG 2.2 Level AA, preserve visible focus and keyboard operation, and verify contrast and accessible names before finishing generated work.
`;
	license.content =
		"# AgentKogei Commercial Pack License\n\nThis synthetic test snapshot may be used only to verify protected Installation and Project License behavior.\n";
	const reportContents = JSON.parse(report.content) as Record<string, unknown>;
	reportContents.pack = "command";
	report.content = `${JSON.stringify(reportContents, null, "\t")}\n`;

	type Manifest = {
		id: string;
		name: string;
		publisher: string;
		access: string;
		release: { publishedAt: string };
		license: Record<string, string>;
		files: Array<{
			path: string;
			target: string;
			sha256: string;
			mediaType: string;
			mode: "0644";
		}>;
		provenance: Array<{
			paths: string[];
			origin: "original" | "third-party";
			author: string;
			license: string;
			attribution: string;
		}>;
		evaluation: { agentGenerationRuns: number };
		preview: { summary: string; surfaces: string[]; route: string };
		changelog: { summary: string };
	};
	const manifest = JSON.parse(manifestFile.content) as Manifest;
	manifest.id = "command";
	manifest.name = "Command";
	manifest.publisher = "AgentKogei";
	manifest.access = "premium";
	manifest.release.publishedAt = "2026-07-19";
	manifest.license = {
		spdx: "LicenseRef-AgentKogei-Commercial",
		name: "AgentKogei Commercial Pack License",
		url: "https://agentkogei.com/docs/premium-pack-license",
		file: "LICENSE.md",
		attribution: "Command by AgentKogei.",
	};
	manifest.evaluation.agentGenerationRuns = 4;
	manifest.preview = {
		summary: "Dark-first, dense, and technical.",
		surfaces: [
			"marketing",
			"authentication",
			"onboarding",
			"dashboard",
			"table",
			"form",
			"settings",
			"states",
		],
		route: "/catalog/command",
	};
	manifest.changelog.summary = "Initial immutable Command Pack Release.";
	manifest.provenance = [
		{
			paths: release.files
				.filter((file) => file.path !== "agentkogei.manifest.json")
				.map((file) => file.path),
			origin: "original",
			author: "AgentKogei",
			license: "LicenseRef-AgentKogei-Commercial",
			attribution: "Command by AgentKogei.",
		},
	];
	manifest.files = release.files
		.filter((file) => file.path !== "agentkogei.manifest.json")
		.map((file) => ({
			path: file.path,
			target: file.target,
			sha256: sha256(file.content),
			mediaType: file.path.endsWith(".json")
				? "application/json"
				: file.path.endsWith(".css")
					? "text/css"
					: file.path.endsWith(".svg")
						? "image/svg+xml"
						: "text/markdown",
			mode: "0644",
		}));
	manifestFile.target = ".agentkogei/command/agentkogei.manifest.json";
	manifestFile.content = JSON.stringify(manifest, null, 2);
	return JSON.stringify(release);
}

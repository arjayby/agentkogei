import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { type PackManifest, packManifestSchema } from "./manifest";

export type PackValidationResult =
	| {
			ok: true;
			pack: string;
			version: string;
			filesValidated: number;
	  }
	| { ok: false; errors: string[] };

export type PackValidationOptions = {
	publishedReleaseDirectory?: string;
};

async function listFiles(directory: string, prefix = ""): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const relativePath = path.posix.join(prefix, entry.name);
			if (entry.isDirectory()) {
				return listFiles(path.join(directory, entry.name), relativePath);
			}
			return [relativePath];
		}),
	);
	return files.flat();
}

function validateReleaseRules(manifest: PackManifest) {
	const errors: string[] = [];
	const targets = new Set<string>();
	const declaredPaths = new Set(manifest.files.map((file) => file.path));
	const provenancedPaths = new Set(
		manifest.provenance.flatMap((entry) => entry.paths),
	);

	for (const file of manifest.files) {
		if (targets.has(file.target)) {
			errors.push(`duplicate target: ${file.target}`);
		}
		targets.add(file.target);
		if (!provenancedPaths.has(file.path)) {
			errors.push(`missing provenance for ${file.path}`);
		}
	}

	for (const provenancePath of provenancedPaths) {
		if (!declaredPaths.has(provenancePath)) {
			errors.push(`provenance references undeclared file: ${provenancePath}`);
		}
	}

	const adapter = manifest.compatibility.adapters.find(
		(candidate) => candidate.id === "react-tailwind-shadcn",
	);
	if (
		!adapter?.frameworks.includes("react") ||
		!adapter.frameworks.includes("nextjs") ||
		adapter.react !== ">=18 <20" ||
		adapter.nextjs !== ">=15 <17" ||
		adapter.tailwind !== ">=4 <5" ||
		adapter.ui !== "shadcn/ui"
	) {
		errors.push(
			"MVP compatibility requires the React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter",
		);
	}

	if (manifest.changelog.breaking && !manifest.changelog.migrationNotes) {
		errors.push("major or breaking releases require migration notes");
	}

	for (const requiredPath of [
		manifest.designContract,
		manifest.license.file,
		manifest.evaluation.evidence,
		...manifest.compatibility.adapters.map((entry) => entry.entry),
	]) {
		if (!declaredPaths.has(requiredPath)) {
			errors.push(`required resource is not declared: ${requiredPath}`);
		}
	}

	const executableGuidance =
		/(?:^|\s)(?:npm|pnpm|yarn|bun|npx|bunx|corepack|pip|pipx|uv|cargo|go|composer|gem|bundle|make|just|curl|wget|bash|sh|node|deno|python|ruby|perl|powershell|pwsh|cmd|chmod)\s+\S+|(?:^|\s)(?:run|execute|invoke|launch)\b[^.\n]*(?:script\b|\.\/|\S+\.(?:sh|js|ts|py|ps1|bat|cmd)\b)|(?:^|\s)(?:\.{0,2}\/|\/bin\/|\/usr\/bin\/)\S+|\S+\.(?:sh|js|ts|py|ps1|bat|cmd)\b|&&|\|\||`|\$\(/i;
	for (const instruction of manifest.dependencies.setup) {
		if (executableGuidance.test(instruction)) {
			errors.push(`dependency guidance must be non-executable: ${instruction}`);
		}
	}

	const requiredScreens = [
		"marketing",
		"authentication",
		"onboarding",
		"dashboard",
		"table",
		"form",
		"settings",
		"states",
	];
	const requiredChecks = [
		"structure",
		"accessibility",
		"responsive overflow",
		"color contrast",
	];
	for (const screen of requiredScreens) {
		if (!manifest.evaluation.screens.includes(screen)) {
			errors.push(`evaluation is missing required screen: ${screen}`);
		}
	}
	if (new Set(manifest.evaluation.screens).size !== requiredScreens.length) {
		errors.push("evaluation screens must be unique and complete");
	}
	for (const viewport of ["1440x900", "390x844"]) {
		if (!manifest.evaluation.viewports.includes(viewport)) {
			errors.push(`evaluation is missing required viewport: ${viewport}`);
		}
	}
	if (
		!manifest.evaluation.colorSchemes.includes("light") ||
		!manifest.evaluation.colorSchemes.includes("dark") ||
		new Set(manifest.evaluation.colorSchemes).size !== 2
	) {
		errors.push("evaluation must cover both light and dark color schemes");
	}
	for (const check of requiredChecks) {
		if (!manifest.evaluation.automatedChecks.includes(check)) {
			errors.push(`evaluation is missing automated check: ${check}`);
		}
	}

	return errors;
}

export async function validatePackRelease(
	rootDirectory: string,
	options: PackValidationOptions = {},
): Promise<PackValidationResult> {
	const errors: string[] = [];
	let manifestContents: string;
	let source: unknown;

	try {
		manifestContents = await readFile(
			path.join(rootDirectory, "agentkogei.manifest.json"),
			"utf8",
		);
		source = JSON.parse(manifestContents);
	} catch {
		return { ok: false, errors: ["manifest is missing or invalid JSON"] };
	}

	if (
		typeof source === "object" &&
		source !== null &&
		["hooks", "scripts", "postinstall", "preinstall"].some((key) =>
			Object.hasOwn(source, key),
		)
	) {
		errors.push("executable hooks and scripts are prohibited");
	}

	const parsed = packManifestSchema.safeParse(source);
	if (!parsed.success) {
		errors.push(
			...parsed.error.issues.map(
				(issue) => `${issue.path.join(".") || "manifest"}: ${issue.message}`,
			),
		);
		return { ok: false, errors };
	}

	const manifest = parsed.data;
	errors.push(...validateReleaseRules(manifest));

	const physicalFiles = (await listFiles(rootDirectory)).filter(
		(file) => file !== "agentkogei.manifest.json",
	);
	const declaredPaths = new Set(manifest.files.map((file) => file.path));
	for (const physicalFile of physicalFiles) {
		if (!declaredPaths.has(physicalFile)) {
			errors.push(`undeclared file: ${physicalFile}`);
		}
	}

	for (const file of manifest.files) {
		try {
			const absolutePath = path.join(rootDirectory, file.path);
			const status = await lstat(absolutePath);
			if (status.isSymbolicLink()) {
				errors.push(`symbolic link is prohibited: ${file.path}`);
				continue;
			}
			const contents = await readFile(absolutePath);
			const digest = createHash("sha256").update(contents).digest("hex");
			if (digest !== file.sha256) {
				errors.push(`hash mismatch for ${file.path}`);
			}
		} catch {
			errors.push(`declared file is missing: ${file.path}`);
		}
	}

	if (options.publishedReleaseDirectory) {
		try {
			const publishedManifestContents = await readFile(
				path.join(
					options.publishedReleaseDirectory,
					"agentkogei.manifest.json",
				),
				"utf8",
			);
			const publishedManifest = packManifestSchema.parse(
				JSON.parse(publishedManifestContents),
			);
			if (
				publishedManifest.id === manifest.id &&
				publishedManifest.release.version === manifest.release.version
			) {
				if (publishedManifestContents !== manifestContents) {
					errors.push(
						`immutable Pack Release ${manifest.id}@${manifest.release.version} differs from the published snapshot`,
					);
				}
			}
		} catch {
			errors.push("published release metadata is missing or invalid");
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		pack: manifest.id,
		version: manifest.release.version,
		filesValidated: manifest.files.length,
	};
}

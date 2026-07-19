import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
	access,
	lstat,
	mkdir,
	mkdtemp,
	open,
	readdir,
	readFile,
	realpath,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { type PackManifest, packManifestSchema } from "./manifest";
import { packReleaseVersionSchema } from "./release-version";
import { validatePackRelease } from "./validator";

const registryFileSchema = z
	.object({
		path: z.string().min(1),
		type: z.literal("registry:file"),
		target: z.string().min(1),
		content: z.string(),
	})
	.strict();

const registryItemSchema = z
	.object({
		$schema: z.literal("https://ui.shadcn.com/schema/registry-item.json"),
		name: z.string().min(1),
		type: z.literal("registry:item"),
		title: z.string().min(1),
		description: z.string().min(1),
		files: z.array(registryFileSchema).min(1),
	})
	.strict();

export type RegistryItem = z.infer<typeof registryItemSchema>;

export type InstallationPlan = {
	manifest: PackManifest;
	item: RegistryItem;
	projectDirectory: string;
	source: string;
	conflicts: string[];
	releaseDirectory: string;
};

export type RetrievedPackRelease = {
	manifest: PackManifest;
	item: RegistryItem;
	source: string;
	releaseDirectory: string;
};

export function installedPackRecord(release: RetrievedPackRelease) {
	const { manifest, item, source } = release;
	return {
		schemaVersion: "1.0",
		pack: { id: manifest.id, version: manifest.release.version },
		source,
		license: manifest.license,
		targets: manifest.files.map((file) => ({
			target: file.target,
			sha256: file.sha256,
		})),
		manifest: {
			target: `.agentkogei/${manifest.id}/agentkogei.manifest.json`,
			sha256: createHash("sha256")
				.update(
					item.files.find((file) => file.path === "agentkogei.manifest.json")
						?.content ?? "",
				)
				.digest("hex"),
		},
	};
}

export async function stageInstalledPackSnapshot(
	stagingDirectory: string,
	release: RetrievedPackRelease,
) {
	const { manifest, item } = release;
	const stagingPackDirectory = path.join(stagingDirectory, manifest.id);
	await mkdir(stagingPackDirectory, { recursive: true, mode: 0o755 });
	for (const file of item.files) {
		const relativeTarget =
			file.path === "agentkogei.manifest.json"
				? "agentkogei.manifest.json"
				: path.relative(`.agentkogei/${manifest.id}`, file.target);
		if (!isSafeRelativePath(relativeTarget)) {
			throw new Error(`unsafe snapshot target: ${file.target}`);
		}
		const target = path.join(stagingPackDirectory, relativeTarget);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, file.content, { mode: 0o644, flag: "wx" });
	}
	await writeFile(
		path.join(stagingDirectory, "installed-pack.json"),
		`${JSON.stringify(installedPackRecord(release), null, 2)}\n`,
		{ mode: 0o644, flag: "wx" },
	);
}

const managedBlockStart = "<!-- agentkogei:design-pack:start -->";
const managedBlockEnd = "<!-- agentkogei:design-pack:end -->";

function isSafeRelativePath(value: string) {
	return (
		value.length > 0 &&
		!value.startsWith("/") &&
		!value.includes("\\") &&
		!value.includes(":") &&
		value
			.split("/")
			.every((segment) => segment !== "" && segment !== "." && segment !== "..")
	);
}

async function readSource(source: URL) {
	if (source.protocol === "file:") {
		return readFile(fileURLToPath(source), "utf8");
	}
	const response = await fetch(source);
	if (!response.ok) {
		throw new Error(`Pack Source retrieval failed (${response.status})`);
	}
	return response.text();
}

async function pathExists(target: string) {
	try {
		await lstat(target);
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return false;
		}
		throw error;
	}
}

async function findSymlinkAncestor(projectDirectory: string, target: string) {
	const relative = path.relative(projectDirectory, target);
	let current = projectDirectory;
	for (const segment of relative.split(path.sep).slice(0, -1)) {
		current = path.join(current, segment);
		try {
			if ((await lstat(current)).isSymbolicLink()) {
				return path.relative(projectDirectory, current);
			}
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return undefined;
			}
			throw error;
		}
	}
	return undefined;
}

async function materializeAndValidate(
	item: RegistryItem,
	identity: string,
): Promise<{ manifest: PackManifest; releaseDirectory: string }> {
	const releaseDirectory = await mkdtemp(
		path.join(tmpdir(), "agentkogei-release-"),
	);
	try {
		const seenPaths = new Set<string>();
		for (const file of item.files) {
			if (!isSafeRelativePath(file.path) || seenPaths.has(file.path)) {
				throw new Error(`unsafe or duplicate registry path: ${file.path}`);
			}
			seenPaths.add(file.path);
			const destination = path.join(releaseDirectory, file.path);
			await mkdir(path.dirname(destination), { recursive: true });
			await writeFile(destination, file.content, { mode: 0o600 });
		}

		const manifestFile = item.files.find(
			(file) => file.path === "agentkogei.manifest.json",
		);
		if (!manifestFile) {
			throw new Error("registry item is missing agentkogei.manifest.json");
		}
		const manifest = packManifestSchema.parse(JSON.parse(manifestFile.content));
		if (manifest.id !== identity || item.name !== identity) {
			throw new Error(`Official Catalog identity does not match ${identity}`);
		}

		const expectedFiles = new Set([
			"agentkogei.manifest.json",
			...manifest.files.map((file) => file.path),
		]);
		for (const file of item.files) {
			if (!expectedFiles.has(file.path)) {
				throw new Error(`undeclared registry resource: ${file.path}`);
			}
		}
		if (seenPaths.size !== expectedFiles.size) {
			throw new Error("registry item does not contain every declared resource");
		}

		const manifestTarget = `.agentkogei/${manifest.id}/agentkogei.manifest.json`;
		if (manifestFile.target !== manifestTarget) {
			throw new Error(`invalid manifest target: ${manifestFile.target}`);
		}
		for (const declared of manifest.files) {
			const managedPrefix = `.agentkogei/${manifest.id}/`;
			if (!declared.target.startsWith(managedPrefix)) {
				throw new Error(
					`target must stay inside the managed snapshot: ${declared.target}`,
				);
			}
			const transported = item.files.find(
				(file) => file.path === declared.path,
			);
			if (!transported || transported.target !== declared.target) {
				throw new Error(`transport target mismatch for ${declared.path}`);
			}
		}

		const validation = await validatePackRelease(releaseDirectory);
		if (!validation.ok) {
			throw new Error(
				`Pack Release validation failed:\n${validation.errors.join("\n")}`,
			);
		}
		return { manifest, releaseDirectory };
	} catch (error) {
		await rm(releaseDirectory, { recursive: true, force: true });
		throw error;
	}
}

async function findProjectConflicts(
	projectDirectory: string,
	manifest: PackManifest,
) {
	const conflicts: string[] = [];
	const recordPath = path.join(
		projectDirectory,
		".agentkogei/installed-pack.json",
	);
	if (await pathExists(recordPath)) {
		conflicts.push("Project already has an Installed Pack");
	}
	const agentsPath = path.join(projectDirectory, "AGENTS.md");
	if (await pathExists(agentsPath)) {
		if ((await lstat(agentsPath)).isSymbolicLink()) {
			conflicts.push("AGENTS.md is a symbolic link");
		} else {
			const agents = await readFile(agentsPath, "utf8");
			if (
				agents.includes(managedBlockStart) ||
				agents.includes(managedBlockEnd)
			) {
				conflicts.push(
					"AGENTS.md already contains an AgentKogei managed block",
				);
			}
		}
	}
	const agentkogeiDirectory = path.join(projectDirectory, ".agentkogei");
	if (await pathExists(agentkogeiDirectory)) {
		if ((await lstat(agentkogeiDirectory)).isSymbolicLink()) {
			conflicts.push(".agentkogei is a symbolic link");
			return [...new Set(conflicts)];
		}
		conflicts.push("reserved .agentkogei path already exists");
		for (const entry of await readdir(agentkogeiDirectory, {
			withFileTypes: true,
		})) {
			if (entry.name === manifest.id || entry.name.startsWith(".install-")) {
				continue;
			}
			if (entry.isSymbolicLink()) {
				conflicts.push(`managed state contains symbolic link ${entry.name}`);
				continue;
			}
			if (
				entry.isDirectory() &&
				(await pathExists(
					path.join(
						agentkogeiDirectory,
						entry.name,
						"agentkogei.manifest.json",
					),
				))
			) {
				conflicts.push(
					`Project already has managed Design Pack state for ${entry.name}`,
				);
			}
		}
	}
	for (const file of manifest.files) {
		const target = path.join(projectDirectory, file.target);
		const symlink = await findSymlinkAncestor(projectDirectory, target);
		if (symlink) {
			conflicts.push(`${file.target} escapes through symbolic link ${symlink}`);
		} else if (await pathExists(target)) {
			conflicts.push(`${file.target} already exists`);
		}
	}
	const manifestInstallTarget = `.agentkogei/${manifest.id}/agentkogei.manifest.json`;
	const manifestTarget = path.join(projectDirectory, manifestInstallTarget);
	const manifestSymlink = await findSymlinkAncestor(
		projectDirectory,
		manifestTarget,
	);
	if (manifestSymlink) {
		conflicts.push(
			`${manifestInstallTarget} escapes through symbolic link ${manifestSymlink}`,
		);
	} else if (await pathExists(manifestTarget)) {
		conflicts.push(`${manifestInstallTarget} already exists`);
	}
	return [...new Set(conflicts)];
}

export async function prepareInstallation(input: {
	identity: string;
	version?: string;
	projectDirectory: string;
	officialCatalogUrl: string;
}): Promise<InstallationPlan> {
	const projectDirectory = await realpath(input.projectDirectory);
	await access(projectDirectory);
	const release = await retrievePackRelease(input);

	try {
		return {
			...release,
			projectDirectory,
			conflicts: await findProjectConflicts(projectDirectory, release.manifest),
		};
	} catch (error) {
		await rm(release.releaseDirectory, { recursive: true, force: true });
		throw error;
	}
}

export async function retrievePackRelease(input: {
	identity: string;
	version?: string;
	officialCatalogUrl: string;
}): Promise<RetrievedPackRelease> {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.identity)) {
		throw new Error("invalid Official Catalog identity");
	}
	if (
		input.version &&
		!packReleaseVersionSchema.safeParse(input.version).success
	) {
		throw new Error("invalid Pack Release version");
	}
	const source = new URL(
		input.version
			? `${input.identity}/${input.version}.json`
			: `${input.identity}.json`,
		input.officialCatalogUrl.endsWith("/")
			? input.officialCatalogUrl
			: `${input.officialCatalogUrl}/`,
	);
	let item: RegistryItem;
	try {
		item = registryItemSchema.parse(JSON.parse(await readSource(source)));
	} catch (error) {
		throw new Error(
			`Pack Source retrieval or parsing failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	const { manifest, releaseDirectory } = await materializeAndValidate(
		item,
		input.identity,
	);
	if (input.version && manifest.release.version !== input.version) {
		await rm(releaseDirectory, { recursive: true, force: true });
		throw new Error(
			`Pack Source returned ${manifest.id}@${manifest.release.version}, expected ${input.identity}@${input.version}`,
		);
	}

	return { manifest, item, source: source.href, releaseDirectory };
}

function managedAgentsBlock(manifest: PackManifest) {
	return `${managedBlockStart}\n## AgentKogei Design Pack\n\nFollow the installed Design Contract at \`.agentkogei/${manifest.id}/${manifest.designContract}\`.\n${managedBlockEnd}\n`;
}

export function formatInstallationPreview(plan: InstallationPlan) {
	const { manifest } = plan;
	const adapter = manifest.compatibility.adapters
		.map(
			(entry) =>
				`${entry.frameworks.join("/")} ${entry.react}; Next.js ${entry.nextjs}; Tailwind ${entry.tailwind}; ${entry.ui}`,
		)
		.join("\n  ");
	return [
		`${manifest.name} ${manifest.release.version} (${manifest.id})`,
		`Pack Source: ${plan.source}`,
		`License: ${manifest.license.name} (${manifest.license.spdx})`,
		`Compatibility:\n  ${adapter}`,
		`Planned writes:\n${[
			...manifest.files.map((file) => `  ${file.target}`),
			`  .agentkogei/${manifest.id}/agentkogei.manifest.json`,
			"  .agentkogei/installed-pack.json",
			"  AGENTS.md (managed reference; existing instructions preserved)",
		].join("\n")}`,
		`Setup instructions:\n${manifest.dependencies.setup.map((line) => `  ${line}`).join("\n") || "  none"}`,
		`Conflicts: ${plan.conflicts.length === 0 ? "none" : `\n${plan.conflicts.map((line) => `  ${line}`).join("\n")}`}`,
	].join("\n\n");
}

export async function applyInstallation(plan: InstallationPlan) {
	if (plan.conflicts.length > 0) {
		throw new Error("Installation has conflicts");
	}
	const { manifest, projectDirectory } = plan;
	const currentConflicts = await findProjectConflicts(
		projectDirectory,
		manifest,
	);
	if (currentConflicts.length > 0) {
		await discardInstallationPlan(plan);
		throw new Error(
			`Project changed after preview; Installation refused:\n${currentConflicts.join("\n")}`,
		);
	}
	const agentkogeiDirectory = path.join(projectDirectory, ".agentkogei");
	const stagingDirectory = path.join(
		projectDirectory,
		`.agentkogei-install-${manifest.id}-${crypto.randomUUID()}`,
	);
	const agentsPath = path.join(projectDirectory, "AGENTS.md");
	let agentsExisted = true;
	let agentsHandle: Awaited<ReturnType<typeof open>>;
	try {
		agentsHandle = await open(
			agentsPath,
			constants.O_RDWR | constants.O_APPEND | constants.O_NOFOLLOW,
		);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			await discardInstallationPlan(plan);
			throw error;
		}
		agentsExisted = false;
		agentsHandle = await open(
			agentsPath,
			constants.O_RDWR |
				constants.O_APPEND |
				constants.O_CREAT |
				constants.O_EXCL |
				constants.O_NOFOLLOW,
			0o644,
		);
	}
	let originalAgents: string;
	try {
		originalAgents = await agentsHandle.readFile("utf8");
	} catch (error) {
		await agentsHandle.close();
		if (!agentsExisted) {
			await rm(agentsPath, { force: true });
		}
		await discardInstallationPlan(plan);
		throw error;
	}
	if (
		originalAgents.includes(managedBlockStart) ||
		originalAgents.includes(managedBlockEnd)
	) {
		await agentsHandle.close();
		await discardInstallationPlan(plan);
		throw new Error("Project changed after preview: AGENTS.md is now managed");
	}
	const separator =
		originalAgents.length === 0 || originalAgents.endsWith("\n") ? "" : "\n";
	const agentsAddition = `${separator}${originalAgents.length > 0 ? "\n" : ""}${managedAgentsBlock(manifest)}`;
	let agentsWritten = false;
	let installationCompleted = false;

	try {
		await stageInstalledPackSnapshot(stagingDirectory, plan);
		await agentsHandle.write(agentsAddition);
		agentsWritten = true;
		await rename(stagingDirectory, agentkogeiDirectory);
		installationCompleted = true;
	} catch (error) {
		await rm(stagingDirectory, { recursive: true, force: true });
		if (agentsWritten) {
			await agentsHandle.truncate(Buffer.byteLength(originalAgents));
		}
		throw error;
	} finally {
		await agentsHandle.close();
		if (!agentsExisted && !installationCompleted) {
			await rm(agentsPath, { force: true });
		}
		await rm(plan.releaseDirectory, { recursive: true, force: true });
	}
}

export async function discardInstallationPlan(plan: {
	releaseDirectory: string;
}) {
	await rm(plan.releaseDirectory, { recursive: true, force: true });
}

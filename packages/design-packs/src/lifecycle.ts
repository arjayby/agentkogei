import { createHash } from "node:crypto";
import {
	lstat,
	readFile,
	realpath,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
	type RetrievedPackRelease,
	retrievePackRelease,
	stageInstalledPackSnapshot,
} from "./installation";
import { type PackManifest, packManifestSchema } from "./manifest";
import {
	type PackReleaseVersion,
	packReleaseVersionSchema,
	type SemanticLevel,
	semanticLevelBetween,
} from "./release-version";

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const updateTransactionSchema = z
	.object({
		backup: z.string().regex(/^\.agentkogei-backup-[a-z0-9-]+-[a-f0-9-]+$/),
		staging: z.string().regex(/^\.agentkogei-update-[a-z0-9-]+-[a-f0-9-]+$/),
	})
	.strict();

const updateTransactionFile = ".agentkogei-update-transaction.json";

const installedPackRecordSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		pack: z
			.object({
				id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
				version: packReleaseVersionSchema,
			})
			.strict(),
		source: z.url(),
		license: z
			.object({
				spdx: z.string().min(1),
				name: z.string().min(1),
				url: z.url(),
				file: z.string().min(1),
				attribution: z.string().min(1),
			})
			.strict(),
		targets: z.array(
			z.object({ target: z.string().min(1), sha256: sha256Schema }).strict(),
		),
		manifest: z
			.object({ target: z.string().min(1), sha256: sha256Schema })
			.strict(),
	})
	.strict();

export type InstalledPackRecord = z.infer<typeof installedPackRecordSchema>;

export type InstalledPackStatus = {
	projectDirectory: string;
	record: InstalledPackRecord;
	manifest?: PackManifest;
	managedState: "managed" | "detached";
	verifiedResources: number;
	totalResources: number;
	integrityProblems: string[];
};

export type UpdatePlan = {
	status: InstalledPackStatus & { manifest: PackManifest };
	proposed: RetrievedPackRelease;
	semanticLevel: SemanticLevel;
	differences: {
		added: string[];
		changed: string[];
		removed: string[];
	};
	conflicts: string[];
};

async function digestFile(target: string) {
	const status = await lstat(target);
	if (!status.isFile() || status.isSymbolicLink()) {
		throw new Error("not a regular file");
	}
	return createHash("sha256")
		.update(await readFile(target))
		.digest("hex");
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

async function recoverInterruptedUpdate(projectDirectory: string) {
	const journalPath = path.join(projectDirectory, updateTransactionFile);
	if (!(await pathExists(journalPath))) {
		return;
	}
	let transaction: z.infer<typeof updateTransactionSchema>;
	try {
		transaction = updateTransactionSchema.parse(
			JSON.parse(await readFile(journalPath, "utf8")),
		);
	} catch (error) {
		throw new Error(
			`Update recovery journal is invalid: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	const agentkogeiDirectory = path.join(projectDirectory, ".agentkogei");
	const backupDirectory = path.join(projectDirectory, transaction.backup);
	const stagingDirectory = path.join(projectDirectory, transaction.staging);
	if (await pathExists(backupDirectory)) {
		await rm(agentkogeiDirectory, { recursive: true, force: true });
		await rename(backupDirectory, agentkogeiDirectory);
	}
	await rm(stagingDirectory, { recursive: true, force: true });
	await rm(journalPath, { force: true });
}

function isSafeManagedTarget(target: string, expectedPrefix: string) {
	return (
		target.startsWith(expectedPrefix) &&
		!target.startsWith("/") &&
		!target.includes("\\") &&
		!target.includes(":") &&
		target
			.split("/")
			.every((segment) => segment !== "" && segment !== "." && segment !== "..")
	);
}

export async function inspectInstalledPack(
	projectDirectory: string,
): Promise<InstalledPackStatus> {
	const resolvedProject = await realpath(projectDirectory);
	await recoverInterruptedUpdate(resolvedProject);
	const recordPath = path.join(
		resolvedProject,
		".agentkogei/installed-pack.json",
	);
	let record: InstalledPackRecord;
	try {
		record = installedPackRecordSchema.parse(
			JSON.parse(await readFile(recordPath, "utf8")),
		);
	} catch (error) {
		throw new Error(
			`Installed Pack record is missing or invalid: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	const expectedPrefix = `.agentkogei/${record.pack.id}/`;
	if (
		!isSafeManagedTarget(record.manifest.target, expectedPrefix) ||
		record.targets.some(
			(entry) => !isSafeManagedTarget(entry.target, expectedPrefix),
		)
	) {
		throw new Error("Installed Pack record contains an unsafe managed target");
	}

	const resources = [record.manifest, ...record.targets];
	const integrityProblems: string[] = [];
	let verifiedResources = 0;
	for (const resource of resources) {
		try {
			if (
				(await digestFile(path.join(resolvedProject, resource.target))) !==
				resource.sha256
			) {
				integrityProblems.push(`${resource.target}: hash mismatch`);
			} else {
				verifiedResources += 1;
			}
		} catch {
			integrityProblems.push(`${resource.target}: missing or unsafe`);
		}
	}

	let manifest: PackManifest | undefined;
	try {
		manifest = packManifestSchema.parse(
			JSON.parse(
				await readFile(
					path.join(resolvedProject, record.manifest.target),
					"utf8",
				),
			),
		);
	} catch (error) {
		integrityProblems.push(
			`Installed Pack manifest is missing or invalid: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	if (
		manifest &&
		(manifest.id !== record.pack.id ||
			manifest.release.version !== record.pack.version ||
			JSON.stringify(manifest.license) !== JSON.stringify(record.license))
	) {
		integrityProblems.push(
			"Installed Pack record does not match its Pack Release manifest",
		);
	}
	if (manifest) {
		const recordedTargets = new Map(
			record.targets.map((entry) => [entry.target, entry.sha256]),
		);
		if (
			recordedTargets.size !== record.targets.length ||
			recordedTargets.size !== manifest.files.length ||
			manifest.files.some(
				(file) => recordedTargets.get(file.target) !== file.sha256,
			)
		) {
			integrityProblems.push(
				"Installed Pack resource record does not match its Pack Release manifest",
			);
		}
	}

	return {
		projectDirectory: resolvedProject,
		record,
		manifest,
		managedState: integrityProblems.length === 0 ? "managed" : "detached",
		verifiedResources,
		totalResources: resources.length,
		integrityProblems,
	};
}

export function formatInstalledPackStatus(status: InstalledPackStatus) {
	return [
		`Installed Pack: ${status.manifest?.name ?? status.record.pack.id} (${status.record.pack.id})`,
		`Pack Release: ${status.record.pack.version}`,
		`Pack Source: ${status.record.source}`,
		`Pack License: ${status.record.license.spdx} (${status.record.license.name})`,
		`Managed state: ${status.managedState}`,
		`Resource integrity: ${status.verifiedResources}/${status.totalResources} verified`,
		...(status.integrityProblems.length === 0
			? []
			: [
					"Integrity problems:",
					...status.integrityProblems.map((problem) => `  ${problem}`),
				]),
	].join("\n");
}

export async function discoverUpdate(input: { projectDirectory: string }) {
	const status = await inspectInstalledPack(input.projectDirectory);
	if (!status.manifest) {
		throw new Error(
			"Update refused because the Installed Pack manifest is invalid; status can show detached resources, but managed update requires reconciliation.",
		);
	}
	const updateStatus = { ...status, manifest: status.manifest };
	const source = new URL(status.record.source);
	const versionedSuffix = `/${status.record.pack.id}/${status.record.pack.version}.json`;
	const catalogPointerSuffix = `/${status.record.pack.id}.json`;
	let catalogUrl: string;
	if (source.pathname.endsWith(versionedSuffix)) {
		catalogUrl = new URL("../", source).href;
	} else if (source.pathname.endsWith(catalogPointerSuffix)) {
		catalogUrl = new URL("./", source).href;
	} else {
		throw new Error(
			"Installed Pack Source cannot be used for update discovery",
		);
	}
	const catalogRelease = await retrievePackRelease({
		identity: status.record.pack.id,
		officialCatalogUrl: catalogUrl,
	});
	if (catalogRelease.manifest.release.version === status.record.pack.version) {
		await rm(catalogRelease.releaseDirectory, { recursive: true, force: true });
		return { status, proposed: undefined };
	}

	const semanticLevel = semanticLevelBetween(
		status.record.pack.version,
		catalogRelease.manifest.release.version,
	);
	if (!semanticLevel) {
		await rm(catalogRelease.releaseDirectory, { recursive: true, force: true });
		throw new Error(
			`Pack Source proposed older Pack Release ${catalogRelease.manifest.release.version}; current is ${status.record.pack.version}`,
		);
	}
	const proposed = await retrievePackRelease({
		identity: status.record.pack.id,
		version: catalogRelease.manifest.release.version,
		officialCatalogUrl: catalogUrl,
	});
	await rm(catalogRelease.releaseDirectory, { recursive: true, force: true });
	if (JSON.stringify(catalogRelease.item) !== JSON.stringify(proposed.item)) {
		await rm(proposed.releaseDirectory, { recursive: true, force: true });
		throw new Error(
			"Catalog Pack Release does not match its immutable versioned Pack Release",
		);
	}

	const currentFiles = new Map(
		status.manifest.files.map((file) => [file.path, file.sha256]),
	);
	const proposedFiles = new Map(
		proposed.manifest.files.map((file) => [file.path, file.sha256]),
	);
	const added = [...proposedFiles.keys()].filter(
		(file) => !currentFiles.has(file),
	);
	const changed = [...proposedFiles].flatMap(([file, hash]) =>
		currentFiles.has(file) && currentFiles.get(file) !== hash ? [file] : [],
	);
	const removed = [...currentFiles.keys()].filter(
		(file) => !proposedFiles.has(file),
	);
	return {
		status: updateStatus,
		proposed,
		semanticLevel,
		differences: { added, changed, removed },
		conflicts: status.integrityProblems,
	} satisfies UpdatePlan;
}

function formatDifference(label: string, resources: string[]) {
	return `${label}: ${resources.length === 0 ? "none" : `\n${resources.map((resource) => `  ${resource}`).join("\n")}`}`;
}

export function formatUpdatePreview(plan: UpdatePlan) {
	const migrationNotes = plan.proposed.manifest.changelog.migrationNotes;
	return [
		`${plan.status.manifest.name} update preview`,
		`Current Pack Release: ${plan.status.record.pack.version}`,
		`Proposed Pack Release: ${plan.proposed.manifest.release.version}`,
		`Semantic level: ${plan.semanticLevel}`,
		...(plan.semanticLevel === "major"
			? [
					"WARNING: Major Pack Release. Review migration notes before consenting.",
				]
			: []),
		`Changelog: ${plan.proposed.manifest.changelog.summary}`,
		`Migration notes: ${migrationNotes ?? "none"}`,
		formatDifference("Added resources", plan.differences.added),
		formatDifference("Changed resources", plan.differences.changed),
		formatDifference("Removed resources", plan.differences.removed),
		`Conflicts: ${plan.conflicts.length === 0 ? "none" : `\n${plan.conflicts.map((conflict) => `  ${conflict}`).join("\n")}`}`,
	].join("\n\n");
}

export async function applyUpdate(
	plan: UpdatePlan,
	consent: { confirmedRelease: PackReleaseVersion },
) {
	if (plan.conflicts.length > 0) {
		throw new Error("Update has conflicts");
	}
	if (consent.confirmedRelease !== plan.proposed.manifest.release.version) {
		throw new Error(
			`Update consent must confirm exact Pack Release ${plan.proposed.manifest.release.version}`,
		);
	}
	const current = await inspectInstalledPack(plan.status.projectDirectory);
	if (
		current.managedState !== "managed" ||
		current.record.pack.id !== plan.status.record.pack.id ||
		current.record.pack.version !== plan.status.record.pack.version
	) {
		throw new Error("Project changed after update preview; update refused");
	}

	const { manifest } = plan.proposed;
	const projectDirectory = plan.status.projectDirectory;
	const agentkogeiDirectory = path.join(projectDirectory, ".agentkogei");
	const transactionId = crypto.randomUUID();
	const stagingDirectory = path.join(
		projectDirectory,
		`.agentkogei-update-${manifest.id}-${transactionId}`,
	);
	const backupDirectory = path.join(
		projectDirectory,
		`.agentkogei-backup-${manifest.id}-${transactionId}`,
	);
	const journalPath = path.join(projectDirectory, updateTransactionFile);
	const journalStagingPath = `${journalPath}.${transactionId}.tmp`;
	let previousMoved = false;
	let replacementMoved = false;
	let interruptedSignal: NodeJS.Signals | undefined;
	const handleSigint = () => {
		interruptedSignal = "SIGINT";
	};
	const handleSigterm = () => {
		interruptedSignal = "SIGTERM";
	};
	try {
		await stageInstalledPackSnapshot(stagingDirectory, plan.proposed);

		const beforeCommit = await inspectInstalledPack(projectDirectory);
		if (
			beforeCommit.managedState !== "managed" ||
			beforeCommit.record.pack.version !== plan.status.record.pack.version
		) {
			throw new Error("Project changed after update preview; update refused");
		}
		await writeFile(
			journalStagingPath,
			`${JSON.stringify({
				backup: path.basename(backupDirectory),
				staging: path.basename(stagingDirectory),
			})}\n`,
			{ mode: 0o600, flag: "wx" },
		);
		await rename(journalStagingPath, journalPath);
		process.on("SIGINT", handleSigint);
		process.on("SIGTERM", handleSigterm);
		try {
			await rename(agentkogeiDirectory, backupDirectory);
			previousMoved = true;
			await new Promise((resolve) => setTimeout(resolve, 250));
			if (interruptedSignal) {
				throw new Error(`Update interrupted by ${interruptedSignal}`);
			}
			await rename(stagingDirectory, agentkogeiDirectory);
			replacementMoved = true;
			if (interruptedSignal) {
				await rm(agentkogeiDirectory, { recursive: true, force: true });
				await rename(backupDirectory, agentkogeiDirectory);
				previousMoved = false;
				replacementMoved = false;
				throw new Error(`Update interrupted by ${interruptedSignal}`);
			}
			await rm(journalPath, { force: true });
		} finally {
			process.off("SIGINT", handleSigint);
			process.off("SIGTERM", handleSigterm);
		}
	} catch (error) {
		if (previousMoved && !replacementMoved) {
			await rename(backupDirectory, agentkogeiDirectory);
			previousMoved = false;
		}
		if (!previousMoved) {
			await rm(journalPath, { force: true });
		}
		throw error;
	} finally {
		await rm(journalStagingPath, { force: true }).catch(() => undefined);
		await rm(stagingDirectory, { recursive: true, force: true }).catch(
			() => undefined,
		);
		await rm(plan.proposed.releaseDirectory, {
			recursive: true,
			force: true,
		}).catch(() => undefined);
	}
	if (replacementMoved) {
		await rm(backupDirectory, { recursive: true, force: true }).catch(
			() => undefined,
		);
	}
}

export async function discardUpdatePlan(plan: UpdatePlan) {
	await rm(plan.proposed.releaseDirectory, { recursive: true, force: true });
}

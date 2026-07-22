import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";
import { z } from "zod";

import { cliConfigDirectory } from "./cli-config";
import {
	type DiagnosticCommand,
	type DiagnosticOutcome,
	diagnosticFieldDisclosure,
	diagnosticPayloadSchema,
} from "./diagnostic-contract";

const diagnosticsConfigSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		enabled: z.literal(true),
		destination: z.url(),
	})
	.strict();

function diagnosticsFile() {
	return path.join(cliConfigDirectory(), "diagnostics.json");
}

function configuredDestination() {
	const value =
		process.env.AGENTKOGEI_DIAGNOSTICS_URL ??
		"https://agentkogei.com/api/cli-diagnostics";
	const destination = new URL(value);
	if (
		destination.protocol !== "https:" &&
		destination.hostname !== "localhost" &&
		destination.hostname !== "127.0.0.1"
	) {
		throw new Error("Diagnostics destination requires HTTPS.");
	}
	return destination.href;
}

export function diagnosticsOptInDisclosure() {
	return diagnosticsDisclosure(configuredDestination());
}

async function readDiagnosticsConfig() {
	try {
		return diagnosticsConfigSchema.parse(
			JSON.parse(await readFile(diagnosticsFile(), "utf8")),
		);
	} catch {
		return null;
	}
}

export function diagnosticsDisclosure(destination: string) {
	return [
		`Destination: ${destination}`,
		"Exact fields sent for each CLI operation:",
		...diagnosticFieldDisclosure.map((field) => `  ${field}`),
		"No Project names, paths, Git remotes, files, prompts, generated UI, dependency lists, credentials, authorization codes, Pack contents, or error messages are sent.",
	].join("\n");
}

export async function diagnosticsStatus() {
	const config = await readDiagnosticsConfig();
	const destination = config?.destination ?? configuredDestination();
	return [
		`Diagnostics: ${config ? "enabled" : "disabled"}`,
		diagnosticsDisclosure(destination),
	].join("\n");
}

export async function diagnosticsEnable() {
	const directory = cliConfigDirectory();
	const destination = configuredDestination();
	await mkdir(directory, { recursive: true, mode: 0o700 });
	await chmod(directory, 0o700);
	await writeFile(
		diagnosticsFile(),
		`${JSON.stringify(
			{ schemaVersion: "1.0", enabled: true, destination },
			null,
			2,
		)}\n`,
		{ mode: 0o600 },
	);
	await chmod(diagnosticsFile(), 0o600);
}

export async function diagnosticsDisable() {
	await rm(diagnosticsFile(), { force: true });
}

export async function sendDiagnostic(
	command: DiagnosticCommand,
	outcome: DiagnosticOutcome,
) {
	const config = await readDiagnosticsConfig();
	if (!config) return;
	try {
		const payload = diagnosticPayloadSchema.parse({
			schema_version: "1.0",
			command,
			outcome,
			platform: platform(),
			runtime: "node",
		});
		await fetch(config.destination, {
			method: "POST",
			redirect: "manual",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(500),
		});
	} catch {
		// Voluntary diagnostics never change the CLI operation's result.
	}
}

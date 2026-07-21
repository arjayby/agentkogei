#!/usr/bin/env bun

import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import {
	applyDesignContractInstallation,
	formatDesignContractPreview,
	planDesignContractInstallation,
} from "./design-contract-installation";
import {
	type DiagnosticCommand,
	diagnosticCommands,
} from "./diagnostic-contract";
import {
	diagnosticsDisable,
	diagnosticsEnable,
	diagnosticsOptInDisclosure,
	diagnosticsStatus,
	sendDiagnostic,
} from "./diagnostics";
import {
	applyInstallation,
	discardInstallationPlan,
	formatInstallationPreview,
	prepareInstallation,
	recordPremiumProjectLicense,
} from "./installation";
import {
	applyUpdate,
	detachInstalledPack,
	discardUpdatePlan,
	discoverUpdate,
	formatDetachPreview,
	formatInstalledPackStatus,
	formatUpdatePreview,
	inspectInstalledPack,
} from "./lifecycle";
import {
	loginWithPackCredential,
	logoutPackCredential,
	readPackCredential,
} from "./pack-credential-cli";

function usage() {
	console.error(
		"Usage:\n  agentkogei add <pack[@version]> [--yes] [--force]\n  agentkogei login [--server <origin>]\n  agentkogei logout\n  agentkogei install <pack[@version]> [--source <registry-base-url/|registry-item-url>] [--project <directory>] [--yes]\n  agentkogei status [--project <directory>]\n  agentkogei update [--project <directory>] [--yes]\n  agentkogei detach [--project <directory>] [--yes]\n  agentkogei diagnostics <status|enable|disable> [--yes]",
	);
}

function optionValue(arguments_: string[], option: string) {
	const index = arguments_.indexOf(option);
	return index === -1 ? undefined : arguments_[index + 1];
}

function redactSensitiveError(error: unknown) {
	return (error instanceof Error ? error.message : String(error))
		.replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]")
		.replace(/\b(?:ak|apk)_[A-Za-z0-9._~-]+\b/g, "[REDACTED]")
		.replace(
			/([?&](?:code|device_code|access_token|authorization_code)=)[^&\s]+/gi,
			"$1[REDACTED]",
		)
		.replace(
			/("(?:access_token|device_code|credential|authorization_code)"\s*:\s*")[^"]+/gi,
			"$1[REDACTED]",
		);
}

async function requestActionConfirmation(
	arguments_: string[],
	question: string,
) {
	if (arguments_.includes("--yes")) {
		return true;
	}
	if (!process.stdin.isTTY || !process.stdout.isTTY) {
		return false;
	}
	const prompt = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	try {
		const answer = await prompt.question(question);
		return answer.trim().toLowerCase() === "y";
	} finally {
		prompt.close();
	}
}

function designContractCatalogUrl() {
	return (
		process.env.AGENTKOGEI_OFFICIAL_CATALOG_URL ??
		"https://agentkogei.com/contracts/"
	);
}

/**
 * `add` retrieves one Design Contract from the Official Catalog and applies it
 * to the current directory as a root `DESIGN.md` and one marked `AGENTS.md`
 * reference, after showing the Builder exactly what will change.
 */
async function addDesignContract(arguments_: string[]) {
	const [selector, ...options] = arguments_;
	if (!selector || selector.startsWith("-")) {
		usage();
		return 2;
	}
	if (options.some((option) => option !== "--yes" && option !== "--force")) {
		usage();
		return 2;
	}
	const [identity, version, extra] = selector.split("@");
	if (!identity || extra !== undefined) {
		usage();
		return 2;
	}

	const plan = await planDesignContractInstallation({
		identity,
		version,
		projectDirectory: process.cwd(),
		officialCatalogUrl: designContractCatalogUrl(),
	});
	console.log(formatDesignContractPreview(plan));
	if (plan.conflicts.length > 0) {
		console.error(
			"Installation refused because conflicts must be resolved first.",
		);
		return 1;
	}
	if (
		plan.designContractChange === "unchanged" &&
		plan.agentsChange === "unchanged"
	) {
		console.log(
			`\n${plan.designPack} ${plan.packRelease} is already this Project's Design Contract.`,
		);
		return 0;
	}
	if (
		plan.designContractChange === "replace" &&
		options.includes("--yes") &&
		!options.includes("--force")
	) {
		console.error(
			"Replacement refused. Replacing an existing DESIGN.md non-interactively requires --yes --force.",
		);
		return 2;
	}

	const confirmed = await requestActionConfirmation(
		options,
		plan.designContractChange === "replace"
			? "Replace this DESIGN.md? [y/N] "
			: "Write this Design Contract? [y/N] ",
	);
	if (!confirmed) {
		console.error(
			"Installation not confirmed. Non-interactive use requires explicit --yes consent.",
		);
		return 2;
	}

	await applyDesignContractInstallation(plan);
	console.log(
		`\nAdded ${plan.designPack} ${plan.packRelease} to ${plan.designContractPath}.`,
	);
	return 0;
}

async function main() {
	const arguments_ = process.argv.slice(2);
	if (arguments_[0] === "add") {
		return addDesignContract(arguments_.slice(1));
	}
	if (arguments_[0] === "diagnostics") {
		if (arguments_[1] === "status") {
			console.log(await diagnosticsStatus());
			return 0;
		}
		if (arguments_[1] === "enable") {
			console.log(diagnosticsOptInDisclosure());
			const confirmed = await requestActionConfirmation(
				arguments_,
				"Enable these diagnostics? [y/N] ",
			);
			if (!confirmed) {
				console.error(
					"Diagnostics not enabled. Non-interactive use requires explicit --yes consent.",
				);
				return 2;
			}
			await diagnosticsEnable();
			console.log(
				"Diagnostics enabled. Use `agentkogei diagnostics disable` at any time.",
			);
			return 0;
		}
		if (arguments_[1] === "disable") {
			await diagnosticsDisable();
			console.log("Diagnostics disabled.");
			return 0;
		}
		usage();
		return 2;
	}
	if (arguments_[0] === "login") {
		const server = optionValue(arguments_, "--server");
		if (arguments_.includes("--server") && !server) {
			usage();
			return 2;
		}
		return loginWithPackCredential(server);
	}
	if (arguments_[0] === "logout") {
		return logoutPackCredential();
	}
	const projectOption = optionValue(arguments_, "--project");
	const sourceOption = optionValue(arguments_, "--source");
	if (
		(arguments_.includes("--project") && !projectOption) ||
		(arguments_.includes("--source") && !sourceOption)
	) {
		usage();
		return 2;
	}
	const projectDirectory = projectOption ?? process.cwd();

	if (arguments_[0] === "status") {
		console.log(
			formatInstalledPackStatus(await inspectInstalledPack(projectDirectory)),
		);
		return 0;
	}
	if (arguments_[0] === "detach") {
		const status = await inspectInstalledPack(projectDirectory);
		if (status.managedState === "detached") {
			console.log(
				`${status.manifest?.name ?? status.record.pack.id} ${status.record.pack.version} is already detached.`,
			);
			return 0;
		}
		console.log(formatDetachPreview(status));
		const confirmed = await requestActionConfirmation(
			arguments_,
			"Detach this Installed Pack? [y/N] ",
		);
		if (!confirmed) {
			console.error(
				"Detach not confirmed. Non-interactive use requires explicit --yes consent.",
			);
			return 2;
		}
		await detachInstalledPack(status);
		console.log(
			`\nDetached ${status.manifest?.name ?? status.record.pack.id} ${status.record.pack.version}.`,
		);
		return 0;
	}
	if (arguments_[0] === "update") {
		const status = await inspectInstalledPack(projectDirectory);
		const storedCredential = await readPackCredential();
		const premiumAuthorization =
			status.record.projectLicense && storedCredential
				? {
						credential: storedCredential.credential,
						server: storedCredential.server,
						projectLicense: status.record.projectLicense,
						action: "update" as const,
					}
				: undefined;
		const discovery = await discoverUpdate({
			projectDirectory,
			...(premiumAuthorization ? { premiumAuthorization } : {}),
		});
		if (!discovery.proposed) {
			console.log(
				`${discovery.status.manifest?.name ?? discovery.status.record.pack.id} ${discovery.status.record.pack.version} is already current.`,
			);
			return 0;
		}
		console.log(formatUpdatePreview(discovery));
		if (discovery.conflicts.length > 0) {
			await discardUpdatePlan(discovery);
			console.error("Update refused because conflicts must be resolved first.");
			return 1;
		}
		const confirmed = await requestActionConfirmation(
			arguments_,
			`Apply exactly ${discovery.proposed.manifest.release.version}? [y/N] `,
		);
		if (!confirmed) {
			await discardUpdatePlan(discovery);
			console.error(
				"Update not confirmed. Non-interactive use requires explicit --yes consent.",
			);
			return 2;
		}
		await applyUpdate(discovery, {
			confirmedRelease: discovery.proposed.manifest.release.version,
		});
		console.log(
			`\nUpdated ${discovery.status.manifest.name} from ${discovery.status.record.pack.version} to ${discovery.proposed.manifest.release.version}.`,
		);
		return 0;
	}

	if (arguments_[0] !== "install" || !arguments_[1]) {
		usage();
		return 2;
	}
	const [identity, version, extra] = arguments_[1].split("@");
	if (!identity || extra !== undefined) {
		usage();
		return 2;
	}
	const storedCredential = await readPackCredential();
	const premiumAuthorization = storedCredential
		? {
				credential: storedCredential.credential,
				server: storedCredential.server,
				projectLicense: randomUUID(),
				action: "install" as const,
			}
		: undefined;
	const plan = await prepareInstallation({
		identity,
		version,
		projectDirectory,
		source: sourceOption,
		officialCatalogUrl:
			process.env.AGENTKOGEI_OFFICIAL_CATALOG_URL ??
			"https://agentkogei.com/r/",
		...(premiumAuthorization ? { premiumAuthorization } : {}),
	});
	console.log(formatInstallationPreview(plan));
	if (plan.conflicts.length > 0) {
		await discardInstallationPlan(plan);
		console.error(
			"Installation refused because conflicts must be resolved first.",
		);
		return 1;
	}

	const confirmed = await requestActionConfirmation(
		arguments_,
		"Install this exact snapshot? [y/N] ",
	);
	if (!confirmed) {
		await discardInstallationPlan(plan);
		console.error(
			"Installation not confirmed. Non-interactive use requires explicit --yes consent.",
		);
		return 2;
	}

	const applied = await applyInstallation(plan);
	if (plan.projectLicense && premiumAuthorization) {
		try {
			await recordPremiumProjectLicense(plan, premiumAuthorization);
		} catch (error) {
			await applied.rollback();
			throw error;
		}
	}
	console.log(
		`\nInstalled ${plan.manifest.id}@${plan.manifest.release.version}.`,
	);
	return 0;
}

const command = process.argv[2];
const diagnosticCommand: DiagnosticCommand | undefined =
	command !== undefined &&
	diagnosticCommands.includes(command as DiagnosticCommand)
		? (command as DiagnosticCommand)
		: undefined;

try {
	process.exitCode = await main();
	if (diagnosticCommand) {
		await sendDiagnostic(
			diagnosticCommand,
			process.exitCode === 0 ? "success" : "error",
		);
	}
} catch (error) {
	console.error(redactSensitiveError(error));
	if (diagnosticCommand) {
		await sendDiagnostic(diagnosticCommand, "error");
	}
	process.exitCode = 1;
}

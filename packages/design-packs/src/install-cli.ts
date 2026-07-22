#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { addDesignContract } from "./add-design-contract";
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
import {
	requestTerminalConsent,
	terminalIsInteractive,
} from "./terminal-consent";

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
	return requestTerminalConsent(question, {
		consented: arguments_.includes("--yes"),
		interactive: terminalIsInteractive(),
	});
}

async function main() {
	const arguments_ = process.argv.slice(2);
	if (arguments_[0] === "add") {
		const result = await addDesignContract(arguments_.slice(1), {
			interactive: terminalIsInteractive(),
		});
		if (result !== "usage") return result;
		usage();
		return 2;
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

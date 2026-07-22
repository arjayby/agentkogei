#!/usr/bin/env node

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
	loginWithPackCredential,
	logoutPackCredential,
} from "./pack-credential-cli";
import {
	requestTerminalConsent,
	terminalIsInteractive,
} from "./terminal-consent";

/**
 * Everything AgentKogei accepts. `add` is the one Design Pack lifecycle
 * operation; the rest support it. Any other command or option is unknown, so a
 * Builder who reaches for a retired verb sees only the interface that exists.
 */
function usage() {
	console.error(
		"Usage:\n  agentkogei add <pack[@version]> [--yes] [--force]\n  agentkogei login [--server <origin>]\n  agentkogei logout\n  agentkogei diagnostics <status|enable|disable> [--yes]",
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
			const confirmed = await requestTerminalConsent(
				"Enable these diagnostics? [y/N] ",
				{
					consented: arguments_.includes("--yes"),
					interactive: terminalIsInteractive(),
				},
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
	usage();
	return 2;
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

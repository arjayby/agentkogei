#!/usr/bin/env node

import { addDesignContract } from "./add-design-contract";
import { terminalIsInteractive } from "./terminal-consent";

/**
 * Everything AgentKogei accepts. `add` is the one Design Pack lifecycle
 * operation; the rest support it. Any other command or option is unknown, so a
 * Builder who reaches for a retired verb sees only the interface that exists.
 */
function usage() {
	console.error("Usage:\n  agentkogei add <pack[@version]> [--yes] [--force]");
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
	usage();
	return 2;
}

try {
	process.exitCode = await main();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}

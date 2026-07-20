import { homedir, platform } from "node:os";
import path from "node:path";

export function cliConfigDirectory() {
	if (process.env.AGENTKOGEI_CONFIG_DIR) {
		return path.resolve(process.env.AGENTKOGEI_CONFIG_DIR);
	}
	if (platform() === "win32" && process.env.APPDATA) {
		return path.join(process.env.APPDATA, "AgentKogei");
	}
	return path.join(
		process.env.XDG_CONFIG_HOME ?? path.join(homedir(), ".config"),
		"agentkogei",
	);
}

import { createInterface } from "node:readline/promises";

/**
 * Asks the Builder to consent to an action that changes their Project or their
 * stored configuration. `--yes` is consent given ahead of time; without it, a
 * terminal nobody is watching must refuse rather than assume agreement.
 */
export async function requestTerminalConsent(
	question: string,
	{ consented, interactive }: { consented: boolean; interactive: boolean },
) {
	if (consented) return true;
	if (!interactive) return false;
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

/** Whether this CLI installation can put a question to a person right now. */
export function terminalIsInteractive() {
	return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

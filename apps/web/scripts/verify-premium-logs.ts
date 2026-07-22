import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	buildTestCommandPackRelease,
	buildTestSignalPackRelease,
} from "../tests/support/premium-delivery-fixture";

/**
 * A protected Pack Release is the raw Markdown a Project installs, so the whole
 * Design Contract is the marker that must never appear in an application log.
 */
function designContractMarker(serialized: string) {
	const { markdown } = JSON.parse(serialized) as { markdown: string };
	return markdown;
}

const protectedMarkers = [
	designContractMarker(buildTestCommandPackRelease()),
	designContractMarker(buildTestSignalPackRelease()),
];
const logPath = path.resolve(".black-box/application.log");
const applicationLog = await readFile(logPath, "utf8");
const leakedMarker = protectedMarkers.find((marker) =>
	applicationLog.includes(marker),
);

if (leakedMarker) {
	throw new Error(`Gated Premium Design Pack bytes appeared in ${logPath}`);
}

console.log(
	"Verified: application logs contain no gated Design Contract bytes.",
);

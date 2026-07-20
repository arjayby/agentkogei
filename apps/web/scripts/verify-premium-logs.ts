import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	buildTestCommandPackRelease,
	buildTestPremiumDeliveryFixture,
	buildTestSignalPackRelease,
} from "../tests/support/premium-delivery-fixture";

function releaseMarkers(serialized: string) {
	const release = JSON.parse(serialized) as {
		files: Array<{ content?: string }>;
	};
	return release.files.flatMap((file) => (file.content ? [file.content] : []));
}

const protectedMarkers = [
	...releaseMarkers(buildTestPremiumDeliveryFixture()),
	...releaseMarkers(buildTestCommandPackRelease()),
	...releaseMarkers(buildTestSignalPackRelease()),
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
	"Verified: application logs contain no gated premium fixture bytes.",
);

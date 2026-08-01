import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function trackedFiles() {
	const process_ = Bun.spawn(["git", "ls-files", "-z"], {
		cwd: projectRoot,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	if (exitCode !== 0) {
		throw new Error(`git ls-files failed: ${stderr.trim()}`);
	}
	return stdout.split("\0").filter(Boolean);
}

const excludedContentPaths = [
	/^\.agents\//,
	/^\.claude\//,
	/^apps\/web\/src\/generated\/design-contracts\.json$/,
	/^apps\/web\/tests\//,
	/^bun\.lock$/,
	/^packages\/design-systems\/releases\//,
	/^packages\/design-systems\/tests\//,
	/^skills-lock\.json$/,
] as const;

const retiredPath =
	/^(?:apps|packages)\/.*(?:^|\/)(?:auth|billing|database|design-packs|diagnostics|migrations?|pack-credentials|premium|premium-source|signal|webhooks?)(?:\/|$)/i;

const retiredContent = [
	{
		name: "legacy product vocabulary",
		pattern: /\b(?:Design Packs?|Interface Systems?|Material Releases?)\b/i,
	},
	{
		name: "retired catalog or commercial vocabulary",
		pattern: /\b(?:Signal|premium|subscription|entitlement)\b/i,
	},
	{
		name: "legacy response header",
		pattern: /x-agentkogei-(?:design-)?pack(?:-release)?/i,
	},
	{
		name: "legacy access classification",
		pattern: /["']access["']\s*:\s*["'](?:open|premium)["']/i,
	},
	{
		name: "retired application infrastructure",
		pattern:
			/AGENTKOGEI_(?:DIAGNOSTICS|PREMIUM)|DATABASE_URL|BETTER_AUTH|POLAR_|better-auth|@polar-sh|@neondatabase\/serverless|drizzle-orm|premium-source|pack-credentials|cli-diagnostics/i,
	},
] as const;

const expectedGeneratedArtifacts = [
	"apps/web/src/generated/design-contracts.json",
];

const files = await trackedFiles();
const failures: string[] = [];

for (const file of files) {
	if (retiredPath.test(file)) {
		failures.push(`${file}: retired path`);
	}

	if (excludedContentPaths.some((pattern) => pattern.test(file))) continue;

	const contents = await readFile(path.join(projectRoot, file));
	if (contents.includes(0)) continue;
	const text = contents.toString("utf8");
	for (const rule of retiredContent) {
		if (rule.pattern.test(text)) {
			failures.push(`${file}: ${rule.name}`);
		}
	}
}

const generatedArtifacts = files.filter((file) =>
	file.startsWith("apps/web/src/generated/"),
);
if (
	JSON.stringify(generatedArtifacts) !==
	JSON.stringify(expectedGeneratedArtifacts)
) {
	failures.push(
		`apps/web/src/generated: expected only ${expectedGeneratedArtifacts.join(", ")}`,
	);
}

if (failures.length > 0) {
	console.error("Release audit failed:");
	for (const failure of failures) console.error(`  ${failure}`);
	process.exit(1);
}

console.log(
	"Release audit passed: no retired commercial or catalog surface is tracked.",
);

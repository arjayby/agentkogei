import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function repositoryFiles() {
	const process_ = Bun.spawn(
		["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
		{
			cwd: projectRoot,
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	if (exitCode !== 0) {
		throw new Error(`git ls-files failed: ${stderr.trim()}`);
	}
	const files = stdout.split("\0").filter(Boolean);
	const present = await Promise.all(
		files.map(async (file) => {
			try {
				await readFile(path.join(projectRoot, file));
				return file;
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code === "ENOENT")
					return undefined;
				throw error;
			}
		}),
	);
	return present.filter((file): file is string => file !== undefined);
}

const excludedContentPaths = [
	/^\.agents\//,
	/^\.claude\//,
	/^bun\.lock$/,
	/^scripts\/audit-release\.ts$/,
	/^skills-lock\.json$/,
] as const;

const retiredPath =
	/(?:^|\/)(?:auth|billing|database|design-packs|diagnostics|migrations?|pack-credentials|premium|premium-source|signal|webhooks?)(?:\/|$)/i;

const retiredContent = [
	{
		name: "legacy product vocabulary",
		pattern: /\b(?:Design Packs?|Interface Systems?|Material Releases?)\b/i,
		allowedMatches: {},
	},
	{
		name: "retired catalog or commercial vocabulary",
		pattern: /\b(?:Signal|premium|subscription|entitlement)\b/i,
		allowedMatches: {
			"apps/web/src/generated/design-contracts.json": 1,
			"apps/web/tests/public-journey.spec.ts": 18,
			"packages/design-systems/releases/mono/1.0/DESIGN.md": 1,
		},
	},
	{
		name: "legacy response header",
		pattern: /x-agentkogei-(?:design-)?pack(?:-release)?/i,
		allowedMatches: {
			"apps/web/tests/public-journey.spec.ts": 2,
		},
	},
	{
		name: "legacy access classification",
		pattern: /["']access["']\s*:\s*["'](?:open|premium)["']/i,
		allowedMatches: {},
	},
	{
		name: "retired application infrastructure",
		pattern:
			/AGENTKOGEI_(?:DIAGNOSTICS|PREMIUM)|DATABASE_URL|BETTER_AUTH|POLAR_|better-auth|@polar-sh|@neondatabase\/serverless|drizzle-orm|premium-source|pack-credentials|cli-diagnostics/i,
		allowedMatches: {
			"apps/web/tests/package-cli.spec.ts": 1,
			"apps/web/tests/public-journey.spec.ts": 5,
			"packages/design-systems/tests/privacy-cli.test.ts": 1,
		},
	},
] as const;

const expectedGeneratedArtifacts = [
	"apps/web/src/generated/design-contracts.json",
	"apps/web/src/generated/official-catalog.json",
];

const files = await repositoryFiles();
const failures: string[] = [];

for (const file of files) {
	const excluded = excludedContentPaths.some((pattern) => pattern.test(file));
	if (!excluded && retiredPath.test(file)) {
		failures.push(`${file}: retired path`);
	}

	if (excluded) continue;

	const contents = await readFile(path.join(projectRoot, file));
	if (contents.includes(0)) continue;
	const text = contents.toString("utf8");
	for (const rule of retiredContent) {
		const matches = text.match(
			new RegExp(rule.pattern.source, `${rule.pattern.flags}g`),
		)?.length;
		const allowed =
			file in rule.allowedMatches
				? rule.allowedMatches[file as keyof typeof rule.allowedMatches]
				: 0;
		if ((matches ?? 0) !== allowed) {
			failures.push(
				`${file}: ${rule.name} matched ${matches ?? 0} times, expected ${allowed}`,
			);
		}
	}
}

const generatedArtifacts = files.filter((file) =>
	/(?:^|\/)generated\//.test(file),
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

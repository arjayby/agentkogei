import { createHash } from "node:crypto";
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
				if (
					["EISDIR", "ENOENT"].includes(
						(error as NodeJS.ErrnoException).code ?? "",
					)
				)
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

const publicIdentityExclusions = [
	/^bun\.lock$/,
	/^packages\/design-systems\/tests\/release-audit\.test\.ts$/,
	/^scripts\/audit-release\.ts$/,
] as const;

const currentMarkdownPaths = [
	/^README\.md$/,
	/^packages\/design-systems\/README\.md$/,
	/^docs\/.*\.md$/,
] as const;
const historicalAdrPath = /^docs\/adr\//;

const publicSourcePath =
	/^(?:apps\/web\/src|packages\/design-systems\/src)\/.*\.[cm]?[jt]sx?$/;
const staleProductionDomain = /\b(?:agentkogei\.co[m]|agentkogei\.de[v])\b/gi;
const publicCollectionTerm = /\bcatalog\b/gi;
const publicSourceCollectionTerm = /\bcatalog\b/i;
const internalCatalogCode =
	/\b(?:const|let|var)\s+catalog\b|Object\.hasOwn\(catalog\b|\bcatalog\[|^\s*catalog:\s*\{/i;
const canonicalInternalCatalogTerm = /\bOfficial\s+Catalog\s+source\b/gi;

const retiredPath =
	/(?:^|\/)(?:auth|billing|database|design-packs|diagnostics|migrations?|pack-credentials|premium|premium-source|signal|webhooks?)(?:\/|$)/i;

const retiredContent = [
	{
		name: "legacy product vocabulary",
		pattern: /\b(?:Design Packs?|Interface Systems?|Material Releases?)\b/i,
		allowedMatches: {},
	},
	{
		name: "retired commercial vocabulary",
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
const immutableReleaseArtifacts = JSON.parse(
	await readFile(
		path.join(
			projectRoot,
			"packages/design-systems/immutable-release-artifacts.json",
		),
		"utf8",
	),
) as Record<string, string>;

const files = await repositoryFiles();
const failures: string[] = [];

for (const file of files) {
	const excluded = excludedContentPaths.some((pattern) => pattern.test(file));
	if (!excluded && retiredPath.test(file)) {
		failures.push(`${file}: retired path`);
	}

	const contents = await readFile(path.join(projectRoot, file));
	if (contents.includes(0)) continue;
	const text = contents.toString("utf8");
	if (
		!publicIdentityExclusions.some((pattern) => pattern.test(file)) &&
		staleProductionDomain.test(text)
	) {
		failures.push(`${file}: stale production domain`);
	}
	staleProductionDomain.lastIndex = 0;

	if (
		currentMarkdownPaths.some((pattern) => pattern.test(file)) &&
		!historicalAdrPath.test(file) &&
		publicCollectionTerm.test(text.replace(canonicalInternalCatalogTerm, ""))
	) {
		failures.push(`${file}: public collection terminology`);
	}
	publicCollectionTerm.lastIndex = 0;

	if (
		publicSourcePath.test(file) &&
		text
			.replace(canonicalInternalCatalogTerm, "")
			.split("\n")
			.some((line) => {
				const trimmed = line.trimStart();
				return (
					publicSourceCollectionTerm.test(line) &&
					!trimmed.startsWith("//") &&
					!trimmed.startsWith("/*") &&
					!trimmed.startsWith("*") &&
					!trimmed.startsWith("import ") &&
					!line.includes("className=") &&
					!line.includes('["catalog"]') &&
					!/["'`]\S*\/catalog/.test(line) &&
					!/["'`]\S*catalog-/.test(line) &&
					!internalCatalogCode.test(line)
				);
			})
	) {
		failures.push(`${file}: public collection terminology`);
	}

	if (excluded) continue;

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

const addDesignContractSource = await readFile(
	path.join(projectRoot, "packages/design-systems/src/add-design-contract.ts"),
	"utf8",
);
if (
	!/AGENTKOGEI_CONTRACT_CATALOG_URL[\s\S]{0,200}\?\?\s*"https:\/\/agentkogei\.vercel\.app\/contracts\/"/.test(
		addDesignContractSource,
	)
) {
	failures.push(
		"packages/design-systems/src/add-design-contract.ts: production retrieval default must be https://agentkogei.vercel.app/contracts/",
	);
}

const packageMetadata = JSON.parse(
	await readFile(
		path.join(projectRoot, "packages/design-systems/package.json"),
		"utf8",
	),
) as Record<string, unknown>;
const projectMetadata = JSON.parse(
	await readFile(path.join(projectRoot, "package.json"), "utf8"),
) as { scripts?: Record<string, string> };
if (
	projectMetadata.scripts?.["launch:verify"] !==
	"bun run scripts/launch-verify.ts"
) {
	failures.push(
		"package.json: launch:verify must run the complete release gate",
	);
}
const repository = packageMetadata.repository as
	| Record<string, unknown>
	| undefined;
const keywords = packageMetadata.keywords as string[] | undefined;
const requiredKeywords = [
	"ai-coding-agents",
	"design-contract",
	"design-systems",
] as const;
if (
	typeof packageMetadata.description !== "string" ||
	!packageMetadata.description
		.toLowerCase()
		.includes("design systems for ai coding agents")
) {
	failures.push(
		"packages/design-systems/package.json: description must state the canonical category",
	);
}
if (packageMetadata.homepage !== "https://agentkogei.vercel.app") {
	failures.push(
		"packages/design-systems/package.json: homepage must be https://agentkogei.vercel.app",
	);
}
if (
	repository?.type !== "git" ||
	repository.url !== "git+https://github.com/arjayby/agentkogei.git" ||
	repository.directory !== "packages/design-systems"
) {
	failures.push(
		"packages/design-systems/package.json: repository metadata must identify the publishable package",
	);
}
if (packageMetadata.license !== "MIT") {
	failures.push("packages/design-systems/package.json: license must be MIT");
}
if (
	!Array.isArray(keywords) ||
	requiredKeywords.some((keyword) => !keywords.includes(keyword))
) {
	failures.push(
		`packages/design-systems/package.json: keywords must include ${requiredKeywords.join(", ")}`,
	);
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

const releaseFiles = files.filter((file) =>
	file.startsWith("packages/design-systems/releases/"),
);
for (const file of releaseFiles) {
	const expectedDigest = immutableReleaseArtifacts[file];
	if (!expectedDigest) {
		failures.push(`${file}: immutable release artifact digest is not pinned`);
		continue;
	}
	const contents = await readFile(path.join(projectRoot, file));
	const actualDigest = createHash("sha256").update(contents).digest("hex");
	if (actualDigest !== expectedDigest) {
		failures.push(`${file}: immutable release artifact digest does not match`);
	}
}
for (const file of Object.keys(immutableReleaseArtifacts)) {
	if (!releaseFiles.includes(file)) {
		failures.push(`${file}: pinned immutable release artifact is missing`);
	}
}

if (failures.length > 0) {
	console.error("Release audit failed:");
	for (const failure of failures) console.error(`  ${failure}`);
	process.exit(1);
}

console.log(
	"Release audit passed: public identity and release invariants hold.",
);

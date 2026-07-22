import { existsSync } from "node:fs";
import path from "node:path";

/**
 * The publishable `agentkogei` tarball, written here by the harness's
 * `cli:pack` step so every runner exercises the artifact that would be
 * published rather than the TypeScript sources.
 */
export const cliTarball = path.resolve(
	process.cwd(),
	process.env.AGENTKOGEI_CLI_TARBALL ??
		"../../packages/design-packs/.distribution/agentkogei.tgz",
);

/**
 * pnpm and modern Yarn are pinned devDependencies so the runner matrix proves
 * compatibility with known versions instead of whatever the machine happens to
 * have installed. Bun hoists workspace binaries, so the lookup walks upwards.
 */
function workspaceBinary(name: string) {
	let directory = process.cwd();
	while (true) {
		const candidate = path.join(directory, "node_modules/.bin", name);
		if (existsSync(candidate)) return candidate;
		const parent = path.dirname(directory);
		if (parent === directory) {
			throw new Error(
				`Cannot find the ${name} executable for the runner matrix`,
			);
		}
		directory = parent;
	}
}

/**
 * Every package runner AgentKogei advertises, expressed as the command that
 * runs one packaged CLI. Each runner is given the tarball explicitly because
 * the package name is not claimed on npm until release; the machinery that
 * downloads, unpacks, and launches the executable is otherwise the same one a
 * Builder uses with `agentkogei@latest`. Every one of them honours the
 * executable's shebang, so all four launch it on Node.js — including `bunx`,
 * which needs `--bun` to do anything else.
 */
export const packageRunners = [
	{
		name: "npx",
		command: (tarball: string) => ({
			command: "npx",
			arguments: ["--yes", "--package", tarball, "--", "agentkogei"],
		}),
	},
	{
		name: "pnpm dlx",
		command: (tarball: string) => ({
			command: workspaceBinary("pnpm"),
			arguments: ["dlx", "--package", tarball, "agentkogei"],
		}),
	},
	{
		name: "yarn dlx",
		command: (tarball: string) => ({
			command: workspaceBinary("yarn"),
			arguments: ["dlx", "--package", tarball, "agentkogei"],
		}),
	},
	{
		name: "bunx",
		command: (tarball: string) => ({
			command: "bunx",
			arguments: ["--package", tarball, "agentkogei"],
		}),
	},
] as const;

import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import {
	mkdir,
	mkdtemp,
	readFile,
	realpath,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { addDesignContract } from "../src/add-design-contract";

/** One Design Contract per Premium catalog identity, as the Official Catalog
 * delivers it: complete direction followed by human-readable provenance. */
const premiumDesignContracts = {
	command: {
		designPack: "Command",
		markdown: `# Command Interface System

Dark-first, dense, and technical direction for the whole product.

---

## Provenance

- Design Pack: Command (\`command\`)
- Pack License: AgentKogei Commercial Pack License (LicenseRef-AgentKogei-Commercial)
`,
	},
	signal: {
		designPack: "Signal",
		markdown: `# Signal Interface System

Bold geometry, expressive color, and richer motion for the whole product.

---

## Provenance

- Design Pack: Signal (\`signal\`)
- Pack License: AgentKogei Commercial Pack License (LicenseRef-AgentKogei-Commercial)
`,
	},
} as const;

type PremiumIdentity = keyof typeof premiumDesignContracts;

const commandContract = premiumDesignContracts.command.markdown;

type ServerState = {
	premiumAccess: "active" | "inactive";
	credentials: Set<string>;
	deviceDecision: "approve" | "deny" | "expire";
	pollsBeforeDecision: number;
	polls: number;
	premiumRequests: Array<{
		url: string;
		headers: Record<string, string>;
		hasBody: boolean;
	}>;
};

let state: ServerState;

function resetState(): ServerState {
	return {
		premiumAccess: "active",
		credentials: new Set(),
		deviceDecision: "approve",
		pollsBeforeDecision: 1,
		polls: 0,
		premiumRequests: [],
	};
}

function markdownResponse(identity: PremiumIdentity) {
	const contract = premiumDesignContracts[identity];
	return new Response(contract.markdown, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "private, no-store",
			"x-agentkogei-design-pack": contract.designPack,
			"x-agentkogei-pack-release": "1.0.0",
			"x-agentkogei-pack-license":
				"AgentKogei Commercial Pack License (LicenseRef-AgentKogei-Commercial)",
		},
	});
}

function refusal(status: 401 | 403, explanation: string, identity: string) {
	return new Response(`${identity} ${explanation}\n`, {
		status,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			...(status === 401
				? { "www-authenticate": 'Bearer realm="AgentKogei Official Catalog"' }
				: {}),
		},
	});
}

const catalog = Bun.serve({
	port: 0,
	async fetch(request) {
		const url = new URL(request.url);
		if (url.pathname === "/api/device/code") {
			const complete = new URL("/device", url.origin);
			complete.searchParams.set("user_code", "TEST-CODE");
			return Response.json({
				device_code: "device-code",
				user_code: "TEST-CODE",
				verification_uri: new URL("/device", url.origin).toString(),
				verification_uri_complete: complete.toString(),
				expires_in: 30,
				interval: 0,
			});
		}
		if (url.pathname === "/api/device/token") {
			state.polls += 1;
			if (state.polls <= state.pollsBeforeDecision) {
				return Response.json(
					{ error: "authorization_pending" },
					{ status: 400 },
				);
			}
			if (state.deviceDecision === "deny") {
				return Response.json({ error: "access_denied" }, { status: 400 });
			}
			if (state.deviceDecision === "expire") {
				return Response.json({ error: "expired_token" }, { status: 400 });
			}
			const credential = `ak_pack_${state.credentials.size}`;
			state.credentials.add(credential);
			return Response.json({ access_token: credential });
		}
		const identity = url.pathname.split("/")[2] ?? "";
		if (
			!url.pathname.startsWith("/contracts/") ||
			!Object.hasOwn(premiumDesignContracts, identity)
		) {
			return new Response("not a Pack Release in the Official Catalog\n", {
				status: 404,
				headers: { "content-type": "text/plain; charset=utf-8" },
			});
		}

		state.premiumRequests.push({
			url: request.url,
			headers: Object.fromEntries(request.headers),
			hasBody: request.body !== null,
		});
		const authorization = request.headers.get("authorization");
		const credential = authorization?.startsWith("Bearer ")
			? authorization.slice("Bearer ".length)
			: null;
		if (!credential || !state.credentials.has(credential)) {
			return refusal(
				401,
				"is a Premium Design Pack and needs an authorized Pack Credential.",
				identity,
			);
		}
		return state.premiumAccess === "active"
			? markdownResponse(identity as PremiumIdentity)
			: refusal(403, "needs active Premium Access.", identity);
	},
});

const catalogOrigin = `http://localhost:${catalog.port}`;
const temporaryDirectories: string[] = [];
const output: string[] = [];
const originalDirectory = process.cwd();
const originalLog = console.log;
const originalError = console.error;

async function temporaryDirectory(prefix: string) {
	const directory = await realpath(
		await mkdtemp(path.join(tmpdir(), `agentkogei-${prefix}-`)),
	);
	temporaryDirectories.push(directory);
	return directory;
}

let project: string;
let configDirectory: string;

beforeEach(async () => {
	state = resetState();
	output.length = 0;
	project = await temporaryDirectory("premium-project");
	configDirectory = await temporaryDirectory("premium-config");
	process.chdir(project);
	process.env.AGENTKOGEI_CONTRACT_CATALOG_URL = `${catalogOrigin}/contracts/`;
	process.env.AGENTKOGEI_CONFIG_DIR = configDirectory;
	process.env.AGENTKOGEI_NO_BROWSER = "1";
	console.log = (...parts: unknown[]) => output.push(parts.join(" "));
	console.error = (...parts: unknown[]) => output.push(parts.join(" "));
});

afterEach(() => {
	console.log = originalLog;
	console.error = originalError;
	process.chdir(originalDirectory);
});

afterAll(async () => {
	await catalog.stop(true);
	await Promise.all(
		temporaryDirectories.map((directory) =>
			rm(directory, { recursive: true, force: true }),
		),
	);
});

async function storeCredential(credential: string, server = catalogOrigin) {
	state.credentials.add(credential);
	await mkdir(configDirectory, { recursive: true });
	await writeFile(
		path.join(configDirectory, "credentials.json"),
		JSON.stringify({ server, credential }),
	);
}

async function projectFile(name: string) {
	try {
		return await readFile(path.join(project, name), "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

async function projectEntries() {
	return (
		await Array.fromAsync(new Bun.Glob("**").scan({ cwd: project, dot: true }))
	).sort();
}

describe("Premium Installation with inline authorization", () => {
	test.each(Object.keys(premiumDesignContracts) as PremiumIdentity[])(
		"authorizes in the browser and resumes the original %s Installation",
		async (identity) => {
			const result = await addDesignContract([identity, "--yes"], {
				interactive: true,
			});

			expect(result).toBe(0);
			expect(output.join("\n")).toContain(
				"Authorize this terminal in your browser",
			);
			expect(await projectFile("DESIGN.md")).toBe(
				premiumDesignContracts[identity].markdown,
			);
			expect(await projectFile("AGENTS.md")).toContain("`DESIGN.md`");
			expect(
				JSON.parse(
					await readFile(
						path.join(configDirectory, "credentials.json"),
						"utf8",
					),
				),
			).toMatchObject({ server: catalogOrigin });
		},
	);

	test("installs directly when an authorized Pack Credential already exists", async () => {
		await storeCredential("ak_pack_existing");

		const result = await addDesignContract(["command@1.0.0", "--yes"], {
			interactive: true,
		});

		expect(result).toBe(0);
		expect(state.polls).toBe(0);
		expect(await projectFile("DESIGN.md")).toBe(commandContract);
	});

	test("leaves the Project unchanged when authorization is denied", async () => {
		state.deviceDecision = "deny";

		const result = await addDesignContract(["command", "--yes"], {
			interactive: true,
		});

		expect(result).toBe(1);
		expect(output.join("\n")).toContain("This Project is unchanged");
		expect(await projectEntries()).toEqual([]);
	});

	test("leaves the Project unchanged when authorization expires", async () => {
		state.deviceDecision = "expire";

		const result = await addDesignContract(["command", "--yes"], {
			interactive: true,
		});

		expect(result).toBe(1);
		expect(await projectEntries()).toEqual([]);
	});

	test("fails clearly without waiting for a browser when not interactive", async () => {
		const result = await addDesignContract(["command", "--yes"], {
			interactive: false,
		});

		expect(result).toBe(2);
		expect(state.polls).toBe(0);
		expect(output.join("\n")).toContain("agentkogei login");
		expect(await projectEntries()).toEqual([]);
	});

	test("stops without exposing the Design Contract when Premium Access is inactive", async () => {
		await storeCredential("ak_pack_expired");
		state.premiumAccess = "inactive";

		const result = await addDesignContract(["command", "--yes"], {
			interactive: true,
		});

		expect(result).toBe(1);
		expect(output.join("\n")).toContain("needs active Premium Access");
		expect(output.join("\n")).not.toContain("Command Interface System");
		expect(await projectEntries()).toEqual([]);
	});

	test("never sends a Pack Credential issued for another server", async () => {
		await storeCredential("ak_pack_elsewhere", "https://other.example.com");

		const result = await addDesignContract(["command", "--yes"], {
			interactive: false,
		});

		expect(result).toBe(2);
		expect(state.premiumRequests).toHaveLength(1);
		expect(state.premiumRequests[0]?.headers.authorization).toBeUndefined();
	});

	test("sends nothing about the Project beyond the selector and Pack Credential", async () => {
		await storeCredential("ak_pack_private");
		await mkdir(path.join(project, ".git"));
		await writeFile(
			path.join(project, ".git/config"),
			'[remote "origin"]\nurl = git@example.com:private/secret-project.git\n',
		);
		await writeFile(
			path.join(project, "package.json"),
			'{"name":"secret-project","dependencies":{"dependency-marker":"1.0.0"}}',
		);

		expect(
			await addDesignContract(["command@1.0.0", "--yes"], {
				interactive: true,
			}),
		).toBe(0);

		expect(state.premiumRequests).toHaveLength(1);
		const [request] = state.premiumRequests;
		expect(request?.url).toBe(`${catalogOrigin}/contracts/command/1.0.0`);
		expect(request?.hasBody).toBe(false);
		expect(Object.keys(request?.headers ?? {}).toSorted()).toEqual([
			"accept",
			"accept-encoding",
			"authorization",
			"connection",
			"host",
			"user-agent",
		]);
		const outbound = JSON.stringify(request);
		for (const privateValue of [
			project,
			"secret-project",
			"dependency-marker",
			"project-license",
		]) {
			expect(outbound).not.toContain(privateValue);
		}
	});
});

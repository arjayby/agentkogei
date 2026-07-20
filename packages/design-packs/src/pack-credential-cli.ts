import { type ChildProcess, spawn } from "node:child_process";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { cliConfigDirectory } from "./cli-config";

const clientId = "agentkogei-cli";
const scope = "premium:retrieve";
const grantType = "urn:ietf:params:oauth:grant-type:device_code";

type StoredCredential = {
	server: string;
	credential: string;
};

type DeviceCodeResponse = {
	device_code: string;
	user_code: string;
	verification_uri: string;
	verification_uri_complete: string;
	expires_in: number;
	interval: number;
};

function normalizeServer(server: string) {
	const url = new URL(server);
	if (url.protocol !== "https:" && url.hostname !== "localhost") {
		throw new Error("Pack Credential authorization requires HTTPS.");
	}
	url.pathname = "/";
	url.search = "";
	url.hash = "";
	return url.toString().replace(/\/$/, "");
}

function credentialFile() {
	return path.join(cliConfigDirectory(), "credentials.json");
}

async function saveCredential(value: StoredCredential) {
	const directory = cliConfigDirectory();
	await mkdir(directory, { recursive: true, mode: 0o700 });
	await chmod(directory, 0o700);
	await writeFile(credentialFile(), `${JSON.stringify(value, null, 2)}\n`, {
		mode: 0o600,
	});
	await chmod(credentialFile(), 0o600);
}

async function responseBody(response: Response) {
	try {
		return (await response.json()) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function openBrowser(url: string) {
	if (process.env.AGENTKOGEI_NO_BROWSER === "1") return;
	const command =
		platform() === "darwin"
			? ["open", url]
			: platform() === "win32"
				? ["cmd", "/c", "start", "", url]
				: ["xdg-open", url];
	const [executable, ...arguments_] = command;
	if (!executable) return;
	const child: ChildProcess = spawn(executable, arguments_, {
		detached: true,
		stdio: "ignore",
	});
	child.on("error", () => {
		// Browser launch is best-effort; the verification URL is always printed.
	});
	child.unref();
}

export async function loginWithPackCredential(serverOption?: string) {
	const server = normalizeServer(serverOption ?? "https://agentkogei.com");
	const response = await fetch(new URL("/api/device/code", server), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			client_id: clientId,
			scope,
			credential_name:
				process.env.AGENTKOGEI_CREDENTIAL_NAME ?? "AgentKogei CLI",
		}),
	});
	if (!response.ok) {
		throw new Error("Could not start terminal authorization.");
	}
	const device = (await response.json()) as DeviceCodeResponse;
	console.log("Authorize this terminal in your browser:");
	console.log(device.verification_uri);
	console.log("The authorization code is redacted from terminal output.");
	console.log("Waiting for browser approval…");
	openBrowser(device.verification_uri_complete);

	const expiresAt = Date.now() + device.expires_in * 1_000;
	while (Date.now() < expiresAt) {
		const tokenResponse = await fetch(new URL("/api/device/token", server), {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				grant_type: grantType,
				device_code: device.device_code,
				client_id: clientId,
			}),
		});
		const token = await responseBody(tokenResponse);
		if (tokenResponse.ok && typeof token.access_token === "string") {
			await saveCredential({ server, credential: token.access_token });
			console.log("Pack Credential saved outside your Project.");
			return 0;
		}
		if (token.error === "authorization_pending") {
			await new Promise((resolve) =>
				setTimeout(resolve, device.interval * 1_000),
			);
			continue;
		}
		if (token.error === "access_denied") {
			console.error("Terminal authorization was denied.");
			return 1;
		}
		if (token.error === "expired_token") {
			console.error("Terminal authorization expired. Start again.");
			return 1;
		}
		throw new Error(
			"Terminal authorization request is invalid or was already used.",
		);
	}
	console.error("Terminal authorization expired. Start again.");
	return 1;
}

export async function logoutPackCredential() {
	await rm(credentialFile(), { force: true });
	console.log(
		"Local Pack Credential removed. Other Pack Credentials remain authorized.",
	);
	return 0;
}

export async function readPackCredential(): Promise<StoredCredential | null> {
	try {
		return JSON.parse(
			await readFile(credentialFile(), "utf8"),
		) as StoredCredential;
	} catch {
		return null;
	}
}

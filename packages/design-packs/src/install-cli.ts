#!/usr/bin/env bun

import { createInterface } from "node:readline/promises";

import {
	applyInstallation,
	discardInstallationPlan,
	formatInstallationPreview,
	prepareInstallation,
} from "./installation";
import {
	applyUpdate,
	discardUpdatePlan,
	discoverUpdate,
	formatInstalledPackStatus,
	formatUpdatePreview,
	inspectInstalledPack,
} from "./lifecycle";

function usage() {
	console.error(
		"Usage:\n  agentkogei install <pack[@version]> [--project <directory>] [--yes]\n  agentkogei status [--project <directory>]\n  agentkogei update [--project <directory>] [--yes]",
	);
}

function optionValue(arguments_: string[], option: string) {
	const index = arguments_.indexOf(option);
	return index === -1 ? undefined : arguments_[index + 1];
}

async function main() {
	const arguments_ = process.argv.slice(2);
	const projectOption = optionValue(arguments_, "--project");
	if (arguments_.includes("--project") && !projectOption) {
		usage();
		return 2;
	}
	const projectDirectory = projectOption ?? process.cwd();

	if (arguments_[0] === "status") {
		console.log(
			formatInstalledPackStatus(await inspectInstalledPack(projectDirectory)),
		);
		return 0;
	}
	if (arguments_[0] === "update") {
		const discovery = await discoverUpdate({
			projectDirectory,
		});
		if (!discovery.proposed) {
			console.log(
				`${discovery.status.manifest?.name ?? discovery.status.record.pack.id} ${discovery.status.record.pack.version} is already current.`,
			);
			return 0;
		}
		console.log(formatUpdatePreview(discovery));
		if (discovery.conflicts.length > 0) {
			await discardUpdatePlan(discovery);
			console.error("Update refused because conflicts must be resolved first.");
			return 1;
		}
		let confirmed = arguments_.includes("--yes");
		if (!confirmed && process.stdin.isTTY && process.stdout.isTTY) {
			const prompt = createInterface({
				input: process.stdin,
				output: process.stdout,
			});
			const answer = await prompt.question(
				`Apply exactly ${discovery.proposed.manifest.release.version}? [y/N] `,
			);
			prompt.close();
			confirmed = answer.trim().toLowerCase() === "y";
		}
		if (!confirmed) {
			await discardUpdatePlan(discovery);
			console.error(
				"Update not confirmed. Non-interactive use requires explicit --yes consent.",
			);
			return 2;
		}
		await applyUpdate(discovery, {
			confirmedRelease: discovery.proposed.manifest.release.version,
		});
		console.log(
			`\nUpdated ${discovery.status.manifest.name} from ${discovery.status.record.pack.version} to ${discovery.proposed.manifest.release.version}.`,
		);
		return 0;
	}

	if (arguments_[0] !== "install" || !arguments_[1]) {
		usage();
		return 2;
	}
	const [identity, version, extra] = arguments_[1].split("@");
	if (!identity || extra !== undefined) {
		usage();
		return 2;
	}

	const plan = await prepareInstallation({
		identity,
		version,
		projectDirectory,
		officialCatalogUrl:
			process.env.AGENTKOGEI_OFFICIAL_CATALOG_URL ??
			"https://agentkogei.com/r/",
	});
	console.log(formatInstallationPreview(plan));
	if (plan.conflicts.length > 0) {
		await discardInstallationPlan(plan);
		console.error(
			"Installation refused because conflicts must be resolved first.",
		);
		return 1;
	}

	let confirmed = arguments_.includes("--yes");
	if (!confirmed && process.stdin.isTTY && process.stdout.isTTY) {
		const prompt = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		const answer = await prompt.question("Install this exact snapshot? [y/N] ");
		prompt.close();
		confirmed = answer.trim().toLowerCase() === "y";
	}
	if (!confirmed) {
		await discardInstallationPlan(plan);
		console.error(
			"Installation not confirmed. Non-interactive use requires explicit --yes consent.",
		);
		return 2;
	}

	await applyInstallation(plan);
	console.log(
		`\nInstalled ${plan.manifest.id}@${plan.manifest.release.version}.`,
	);
	return 0;
}

try {
	process.exitCode = await main();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}

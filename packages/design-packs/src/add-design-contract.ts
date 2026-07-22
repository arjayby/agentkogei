import {
	applyDesignContractInstallation,
	type DesignContractInstallationPlan,
	formatDesignContractPreview,
	PackCredentialRequiredError,
	PremiumAccessRequiredError,
	planDesignContractInstallation,
} from "./design-contract-installation";
import {
	loginWithPackCredential,
	readPackCredential,
} from "./pack-credential-cli";
import { requestTerminalConsent } from "./terminal-consent";

/**
 * Raw Design Contract delivery has its own setting because the legacy registry
 * transport still reads `AGENTKOGEI_OFFICIAL_CATALOG_URL`; one variable cannot
 * name two incompatible endpoints.
 */
function designContractCatalogUrl() {
	return (
		process.env.AGENTKOGEI_CONTRACT_CATALOG_URL ??
		"https://agentkogei.com/contracts/"
	);
}

/**
 * A Pack Credential authorizes one AgentKogei server, so it travels only to the
 * Official Catalog it was issued for and never to another origin.
 */
async function packCredentialFor(officialCatalogUrl: string) {
	const stored = await readPackCredential();
	if (!stored) return undefined;
	try {
		return new URL(stored.server).origin === new URL(officialCatalogUrl).origin
			? stored.credential
			: undefined;
	} catch {
		return undefined;
	}
}

/**
 * Plans the Installation, and when the Official Catalog wants a Pack Credential
 * the CLI does not have, authorizes this terminal in the browser and resumes
 * the Installation the Builder originally asked for. Returns `null` when the
 * Builder never became authorized, leaving the Project untouched.
 */
async function planWithPremiumAuthorization(
	selection: { identity: string; version?: string | undefined },
	interactive: boolean,
): Promise<DesignContractInstallationPlan | null> {
	const officialCatalogUrl = designContractCatalogUrl();
	const plan = async () =>
		planDesignContractInstallation({
			...selection,
			projectDirectory: process.cwd(),
			officialCatalogUrl,
			packCredential: await packCredentialFor(officialCatalogUrl),
		});

	try {
		return await plan();
	} catch (error) {
		if (!(error instanceof PackCredentialRequiredError)) throw error;
		if (!interactive) {
			throw new PackCredentialRequiredError(
				`${error.message}. Run \`agentkogei login\` from a terminal that can open a browser before installing a Premium Design Pack.`,
			);
		}
		console.log(`${error.message}.\n`);
		const authorized = await loginWithPackCredential(
			new URL(officialCatalogUrl).origin,
		);
		if (authorized !== 0) return null;
		console.log("");
		return plan();
	}
}

/**
 * `add` retrieves one Design Contract from the Official Catalog and applies it
 * to the current directory as a root `DESIGN.md` and one marked `AGENTS.md`
 * reference, after showing the Builder exactly what will change. Open and
 * Premium Design Packs use the same command; only Premium ones may pause for
 * browser authorization first.
 */
export async function addDesignContract(
	arguments_: string[],
	{ interactive }: { interactive: boolean },
) {
	const [selector, ...options] = arguments_;
	if (!selector || selector.startsWith("-")) return "usage" as const;
	if (options.some((option) => option !== "--yes" && option !== "--force")) {
		return "usage" as const;
	}
	const [identity, version, extra] = selector.split("@");
	if (!identity || extra !== undefined) return "usage" as const;
	const consented = options.includes("--yes");

	let plan: DesignContractInstallationPlan | null;
	try {
		plan = await planWithPremiumAuthorization(
			{ identity, version },
			interactive,
		);
	} catch (error) {
		if (error instanceof PackCredentialRequiredError) {
			console.error(error.message);
			return 2;
		}
		if (error instanceof PremiumAccessRequiredError) {
			console.error(
				`${error.message}. Renew Premium Access to install it; this Project is unchanged.`,
			);
			return 1;
		}
		throw error;
	}
	if (!plan) {
		console.error("Installation stopped. This Project is unchanged.");
		return 1;
	}

	console.log(formatDesignContractPreview(plan));
	if (plan.conflicts.length > 0) {
		console.error(
			"Installation refused because conflicts must be resolved first.",
		);
		return 1;
	}
	if (
		plan.designContractChange === "unchanged" &&
		plan.agentsChange === "unchanged"
	) {
		console.log(
			`\n${plan.designPack} ${plan.packRelease} is already this Project's Design Contract.`,
		);
		return 0;
	}
	if (
		plan.designContractChange === "replace" &&
		consented &&
		!options.includes("--force")
	) {
		console.error(
			"Replacement refused. Replacing an existing DESIGN.md non-interactively requires --yes --force.",
		);
		return 2;
	}

	const confirmed = await requestTerminalConsent(
		plan.designContractChange === "replace"
			? "Replace this DESIGN.md? [y/N] "
			: "Write this Design Contract? [y/N] ",
		{ consented, interactive },
	);
	if (!confirmed) {
		console.error(
			"Installation not confirmed. Non-interactive use requires explicit --yes consent.",
		);
		return 2;
	}

	await applyDesignContractInstallation(plan);
	console.log(
		`\nAdded ${plan.designPack} ${plan.packRelease} to ${plan.designContractPath}.`,
	);
	return 0;
}

import {
	applyDesignContractInstallation,
	formatDesignContractPreview,
	planDesignContractInstallation,
} from "./design-contract-installation";
import { requestTerminalConsent } from "./terminal-consent";

/** Where `add` retrieves Design Contracts, overridable so tests and previews
 * can point at a catalog other than the production one. */
function designContractCatalogUrl() {
	return (
		process.env.AGENTKOGEI_CONTRACT_CATALOG_URL ??
		"https://agentkogei.com/contracts/"
	);
}

/**
 * `add` retrieves one Design Contract from the Official Catalog and applies it
 * to the current directory as a root `DESIGN.md` and one marked `AGENTS.md`
 * reference, after showing the Builder exactly what will change.
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

	const plan = await planDesignContractInstallation({
		identity,
		version,
		projectDirectory: process.cwd(),
		officialCatalogUrl: designContractCatalogUrl(),
	});

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
			`\n${plan.designSystem} Design System Release ${plan.designSystemRelease} is already this Project's Design Contract.`,
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
		`\nInstalled ${plan.designSystem} Design System Release ${plan.designSystemRelease} as ${plan.designContractPath}.`,
	);
	return 0;
}

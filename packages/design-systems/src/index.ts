import { fileURLToPath } from "node:url";
import { discoverPublishedDesignSystems } from "./published-design-systems";

export {
	type DesignContract,
	designContractFileName,
	designContractSchema,
	readDesignContract,
} from "./design-contract";
export {
	applyDesignContractInstallation,
	type DesignContractInstallationPlan,
	formatDesignContractDiff,
	formatDesignContractPreview,
	planDesignContractInstallation,
	retrieveDesignContract,
} from "./design-contract-installation";
export {
	type DesignSystemAdditionReport,
	designSystemAdditionReportSchema,
} from "./design-system-addition";
export {
	type DesignSystemEvaluationRecord,
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
	designSystemMarkRecipes,
	designSystemPreviewFontChoices,
	designSystemPreviewSchema,
	designSystemPreviewSurfaces,
} from "./design-system-evaluation";
export type { DesignSystemIdentity } from "./design-system-identity";
export { generateOfficialCatalogArtifacts } from "./official-catalog-generation";
export {
	discoverPublishedDesignSystems,
	type PublishedDesignSystem,
	type PublishedDesignSystemRelease,
} from "./published-design-systems";
export {
	compareDesignSystemReleaseVersions,
	type DesignSystemReleaseVersion,
	designSystemReleaseVersionSchema,
} from "./release-version";
export {
	type DesignSystemValidationOptions,
	type DesignSystemValidationResult,
	validateDesignSystemRelease,
} from "./validator";

const releasesDirectory = fileURLToPath(
	new URL("../releases", import.meta.url),
);

export const publishedDesignSystems =
	await discoverPublishedDesignSystems(releasesDirectory);

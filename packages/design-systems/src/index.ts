import { fileURLToPath } from "node:url";
import { discoverPublishedDesignSystems } from "./published-design-systems";

export {
	type CandidateValidationOptions,
	type CandidateValidationResult,
	candidateDesignContractFileName,
	candidateEvaluationPlanFileName,
	candidateEvaluationPlanSchema,
	candidateMetadataFileName,
	candidateMetadataSchema,
	validateCandidateDesignSystemRelease,
} from "./candidate-design-system";
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
	contractRetrievalProtocol,
	inspectPublicationProposal,
	productionWebsiteUrl,
	promoteApprovedPublication,
	publicationApprovalSchema,
	publicationVerificationSchema,
	recordPublicationApproval,
	verifyContractRetrievalProtocol,
	verifyProductionPublication,
} from "./publication-release";
export {
	approvePublicationHumanReview,
	type EvaluationResultKind,
	type EvaluationResultStatus,
	type HumanReviewKind,
	type PublicationWorkflowResult,
	preparePublicationProposal,
	publicationEvaluationSchema,
	publicationProposalMetadataSchema,
	publicationWorkflowDirectoryName,
	publicationWorkflowFileName,
	recordPublicationEvaluationResult,
	startPublicationEvaluation,
} from "./publication-workflow";
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

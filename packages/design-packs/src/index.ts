import { fileURLToPath } from "node:url";

export {
	applyInstallation,
	discardInstallationPlan,
	formatInstallationPreview,
	type InstallationPlan,
	prepareInstallation,
} from "./installation";
export { type PackManifest, packManifestSchema } from "./manifest";
export type { FoundationRegistryItem } from "./registry";
export {
	type PackValidationOptions,
	type PackValidationResult,
	validatePackRelease,
} from "./validator";

export const foundationReleaseDirectory = fileURLToPath(
	new URL("../releases/foundation/1.0.0", import.meta.url),
);

export async function buildFoundationRegistryItem() {
	const { buildFoundationRegistryItem: build } = await import("./registry");
	return build(foundationReleaseDirectory);
}

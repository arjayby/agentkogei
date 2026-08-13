import type { OfficialCatalogArtifacts } from "agentkogei/src/official-catalog-generation";

import officialCatalog from "@/generated/official-catalog.json";

type OfficialCatalog = OfficialCatalogArtifacts["catalog"];
type PublishedCatalogEntry = OfficialCatalog["designSystems"][number];

export type DesignSystemRelease = PublishedCatalogEntry["releases"][number];
export type PreviewPalette =
	PublishedCatalogEntry["preview"]["theme"]["tokens"]["light"];
export type DesignSystem = Omit<PublishedCatalogEntry, "id"> & {
	slug: string;
};

export type Preview = DesignSystem["preview"];

export type DesignSystemDiscovery = Pick<
	DesignSystem,
	"name" | "preview" | "slug"
>;

export function previewSurfaceNames(preview: Preview) {
	return Object.keys(preview.productSurfaces.examples) as Array<
		keyof Preview["productSurfaces"]["examples"]
	>;
}

export function designSystemDiscoveryFor(
	designSystem: DesignSystem,
): DesignSystemDiscovery {
	return {
		name: designSystem.name,
		slug: designSystem.slug,
		preview: designSystem.preview,
	};
}

/**
 * The sections every Published Design System consolidates into its Design Contract.
 * Installation writes one root `DESIGN.md`, so this describes that document's
 * own content rather than a set of files a Builder receives.
 */
export const contractSections = [
	"Interface principles, layout, and product surfaces",
	"Semantic tokens and their definitions",
	"Components, interaction states, and feedback",
	"Motion and accessibility direction",
	"Agent instructions and worked examples",
	"A final validation checklist",
	"React or Next.js, Tailwind CSS v4, and shadcn/ui implementation direction",
] as const;

/** The generated catalog is already validated before this module is built. */
const generatedCatalog = officialCatalog as unknown as OfficialCatalog;

export const designSystems: readonly DesignSystem[] =
	generatedCatalog.designSystems.map(({ id, ...designSystem }) => ({
		...designSystem,
		slug: id,
	}));

export function installationChoices() {
	return designSystems.map(({ slug, name }) => ({ slug, name }));
}

export function getDesignSystem(slug: string) {
	return designSystems.find((designSystem) => designSystem.slug === slug);
}

/** The Design System Release a bare identity selects. */
export function currentRelease(designSystem: DesignSystem) {
	const release = designSystem.releases.find(
		(candidate) => candidate.version === designSystem.currentRelease,
	);
	if (!release) {
		throw new Error(
			`${designSystem.name} has no current Design System Release ${designSystem.currentRelease}`,
		);
	}
	return release;
}

export function catalogMetadataLabel(value: string) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function compatibilityText(designSystem: DesignSystem) {
	const { compatibility } = designSystem;
	return `React ${compatibility.react} · Next.js ${compatibility.nextjs} · Tailwind ${compatibility.tailwind} · ${compatibility.ui}`;
}

export function evaluationText(designSystem: DesignSystem) {
	const status =
		designSystem.evaluation.status.charAt(0).toLowerCase() +
		designSystem.evaluation.status.slice(1);
	return `Design System Evaluation ${status} · ${designSystem.evaluation.standard} reference implementation`;
}

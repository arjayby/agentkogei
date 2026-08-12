import type { CSSProperties, SVGProps } from "react";

import type { DesignSystem, DesignSystemDiscovery } from "@/lib/catalog";

type MarkDrawingProps = SVGProps<SVGSVGElement>;

type DesignSystemMarkStyle = CSSProperties & {
	"--design-system-mark-primary-dark": string;
	"--design-system-mark-primary-light": string;
};

const markColors = {
	base: "var(--preview-primary)",
	highlight: "color-mix(in oklab, var(--preview-primary) 68%, white)",
	shade: "color-mix(in oklab, var(--preview-primary) 72%, black)",
	outline: "color-mix(in oklab, var(--preview-primary) 48%, black)",
} as const;

const quarterTurns = [0, 90, 180, 270] as const;
const thirdTurns = [0, 120, 240] as const;
const sixthTurns = [0, 60, 120, 180, 240, 300] as const;

function StructuralBlocks() {
	return (
		<>
			{quarterTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="M24 12 32 7l8 5v13l-8 7-8-7V12Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path d="m24 12 8 5 8-5-8-5-8 5Z" fill={markColors.highlight} />
					<path
						d="m32 17 8-5v13l-8 7V17Z"
						fill={markColors.shade}
						opacity="0.72"
					/>
					<path
						d="m24 12 8 5 8-5M32 17v15"
						fill="none"
						stroke={markColors.outline}
						strokeWidth="1.25"
						strokeLinejoin="round"
						opacity="0.72"
					/>
				</g>
			))}
		</>
	);
}

function TurningPagePetals() {
	return (
		<>
			{thirdTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="M32 6c9 3 14 10 13 18-1 6-6 11-13 14-4-5-8-11-8-18 0-6 3-11 8-14Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path
						d="M32 9c6 3 10 8 10 14 0 4-3 8-8 11-2-5-4-10-4-15 0-4 1-8 2-10Z"
						fill={markColors.highlight}
						opacity="0.82"
					/>
					<path
						d="M34 34c5-3 8-7 8-11 0-4-2-8-5-11 2 8 1 16-3 22Z"
						fill={markColors.shade}
						opacity="0.46"
					/>
					<path
						d="M32 9c-2 9-1 18 2 25"
						fill="none"
						stroke={markColors.outline}
						strokeWidth="1.25"
						strokeLinecap="round"
						opacity="0.68"
					/>
				</g>
			))}
		</>
	);
}

function InterwovenCells() {
	return (
		<>
			{quarterTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="M31 7c10 0 18 8 18 18 0 6-3 11-8 14 0-7-4-11-10-11-6 0-10-4-10-10 0-6 4-11 10-11Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path
						d="M31 10c7 0 13 5 15 12 1 5-1 9-4 13-2-6-6-9-11-9-4 0-7-3-7-7 0-5 3-9 7-9Z"
						fill={markColors.highlight}
						opacity="0.74"
					/>
					<path
						d="M41 39c0-7-4-11-10-11-6 0-10-4-10-10 0 8 5 13 12 13 4 0 7 2 9 8Z"
						fill={markColors.shade}
						opacity="0.58"
					/>
				</g>
			))}
		</>
	);
}

function DirectionalChevrons() {
	return (
		<>
			{sixthTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="m23 8 9 8 9-8 3 5-12 12-12-12 3-5Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path
						d="m23 8 9 8 9-8-1 4-8 8-10-9 1-3Z"
						fill={markColors.highlight}
						opacity="0.78"
					/>
					<path
						d="m32 20 8-8 4 1-12 12v-5Z"
						fill={markColors.shade}
						opacity="0.72"
					/>
				</g>
			))}
			<circle
				cx="32"
				cy="32"
				r="4.5"
				fill={markColors.highlight}
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
		</>
	);
}

const drawings = {
	"structural-planes": {
		Drawing: StructuralBlocks,
		label: "Four interlocking structural blocks",
	},
	"page-leaves": {
		Drawing: TurningPagePetals,
		label: "Three turning page petals",
	},
	"nested-apertures": {
		Drawing: InterwovenCells,
		label: "Four interwoven repeating cells",
	},
	"directional-nodes": {
		Drawing: DirectionalChevrons,
		label: "Six directional chevrons converging on a core",
	},
} as const;

export function DesignSystemMark({
	designSystem,
	className,
	style,
	...props
}: {
	designSystem: DesignSystem | DesignSystemDiscovery;
} & MarkDrawingProps) {
	const { mark } = designSystem.preview;
	const { Drawing, label } = drawings[mark.recipe];
	const markStyle: DesignSystemMarkStyle = {
		...style,
		"--design-system-mark-primary-dark":
			designSystem.preview.theme.tokens.dark.primary,
		"--design-system-mark-primary-light":
			designSystem.preview.theme.tokens.light.primary,
	};

	return (
		<svg
			viewBox="0 0 64 64"
			role="img"
			aria-label={`${designSystem.name} Design System Mark`}
			aria-description={label}
			data-mark-recipe={mark.recipe}
			className={className}
			{...props}
			data-design-system-mark={designSystem.slug}
			style={markStyle}
		>
			<title>{`${designSystem.name} Design System Mark`}</title>
			<desc>{label}</desc>
			<Drawing />
		</svg>
	);
}

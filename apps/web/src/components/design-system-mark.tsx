import { cn } from "@agentkogei/ui/lib/utils";
import type { CSSProperties, SVGProps } from "react";

import type { DesignSystem, DesignSystemDiscovery } from "@/lib/catalog";
import styles from "./design-system-mark.module.css";

type MarkDrawingProps = SVGProps<SVGSVGElement>;

type DesignSystemMarkStyle = CSSProperties & {
	"--design-system-mark-background-dark": string;
	"--design-system-mark-background-light": string;
	"--design-system-mark-foreground-dark": string;
	"--design-system-mark-foreground-light": string;
	"--design-system-mark-primary-dark": string;
	"--design-system-mark-primary-light": string;
	"--design-system-mark-primary-foreground-dark": string;
	"--design-system-mark-primary-foreground-light": string;
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

function RelayLoop() {
	return (
		<>
			{quarterTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="M12 9h20c11 0 20 7 23 18l-9 3c-2-7-7-11-14-11H12V9Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path
						d="M15 12h17c8 0 15 5 19 13l-4 1c-3-6-8-10-15-10H15v-4Z"
						fill={markColors.highlight}
						opacity="0.84"
					/>
					<path
						d="M32 19c7 0 12 4 14 11l5-2c-3-9-10-14-19-14v5Z"
						fill={markColors.shade}
						opacity="0.58"
					/>
				</g>
			))}
			<rect
				x="27.5"
				y="27.5"
				width="9"
				height="9"
				rx="2"
				fill={markColors.highlight}
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
		</>
	);
}

function SpecimenFrame() {
	return (
		<>
			<rect
				x="12"
				y="12"
				width="40"
				height="40"
				fill="none"
				stroke={markColors.base}
				strokeWidth="7"
				strokeDasharray="15 5"
				strokeLinejoin="miter"
			/>
			<rect
				x="20"
				y="20"
				width="24"
				height="24"
				fill={markColors.highlight}
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
			<path
				d="M20 36 36 20h8L20 44v-8Z"
				fill={markColors.shade}
				opacity="0.7"
			/>
			<circle
				cx="32"
				cy="32"
				r="3.75"
				fill={markColors.base}
				stroke={markColors.outline}
				strokeWidth="1.5"
			/>
		</>
	);
}

function PulseSequence() {
	const cells = [
		{ x: 8, y: 40, tone: markColors.shade },
		{ x: 20, y: 32, tone: markColors.base },
		{ x: 32, y: 24, tone: markColors.highlight },
		{ x: 44, y: 16, tone: markColors.base },
	] as const;

	return (
		<>
			<path
				d="m13 45 12-8 12-8 12-8"
				fill="none"
				stroke={markColors.outline}
				strokeWidth="3"
				strokeLinecap="square"
				strokeLinejoin="bevel"
			/>
			{cells.map(({ x, y, tone }) => (
				<rect
					key={`${x}-${y}`}
					x={x}
					y={y}
					width="10"
					height="10"
					rx="1.5"
					fill={tone}
					stroke={markColors.outline}
					strokeWidth="1.75"
				/>
			))}
			<path
				d="M49 16h7v7"
				fill="none"
				stroke={markColors.highlight}
				strokeWidth="2.5"
				strokeLinecap="square"
			/>
		</>
	);
}

function LumenWindow() {
	return (
		<>
			{quarterTurns.map((rotation) => (
				<g key={rotation} transform={`rotate(${rotation} 32 32)`}>
					<path
						d="M25 7h14l-2 16-5 6-5-6-2-16Z"
						fill={markColors.base}
						stroke={markColors.outline}
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
					<path
						d="M28 10h8l-1 11-3 4-3-4-1-11Z"
						fill={markColors.highlight}
						opacity="0.88"
					/>
					<path
						d="m32 25 3-4 1-11h3l-2 13-5 6v-4Z"
						fill={markColors.shade}
						opacity="0.62"
					/>
				</g>
			))}
			<rect
				x="27"
				y="27"
				width="10"
				height="10"
				rx="1.5"
				fill={markColors.highlight}
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
		</>
	);
}

function FormOrbit() {
	return (
		<>
			<path
				d="M12 23c0-7 5-12 12-12h9v12c0 7-5 12-12 12h-9V23Z"
				fill={markColors.base}
				stroke={markColors.outline}
				strokeWidth="1.75"
				strokeLinejoin="round"
			/>
			<path
				d="M15 22c0-5 4-8 9-8h6v6c0 6-4 10-10 10h-5v-8Z"
				fill={markColors.highlight}
				opacity="0.8"
			/>
			<path
				d="M31 29h9c7 0 12 5 12 12v12H40c-7 0-12-5-12-12v-9c0-2 1-3 3-3Z"
				fill={markColors.base}
				stroke={markColors.outline}
				strokeWidth="1.75"
				strokeLinejoin="round"
			/>
			<path
				d="M35 32h5c5 0 9 4 9 9v8h-8c-5 0-9-4-9-9v-5c0-2 1-3 3-3Z"
				fill={markColors.shade}
				opacity="0.64"
			/>
			<circle
				cx="38"
				cy="20"
				r="8"
				fill={markColors.highlight}
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
			<circle
				cx="26"
				cy="39"
				r="5"
				fill="var(--preview-background)"
				stroke={markColors.outline}
				strokeWidth="1.75"
			/>
			<path
				d="M43 15c2 3 2 6 0 9M47 34c2 3 3 7 2 11M17 19c3-3 6-4 10-4"
				fill="none"
				stroke={markColors.outline}
				strokeWidth="1.25"
				strokeLinecap="round"
				opacity="0.66"
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
	"relay-loop": {
		Drawing: RelayLoop,
		label: "Four linked relay segments circling a shared route",
	},
	"specimen-frame": {
		Drawing: SpecimenFrame,
		label: "Four primary colored register corners framing a specimen",
	},
	"pulse-sequence": {
		Drawing: PulseSequence,
		label: "Four stepped pulse cells advancing along a rising rail",
	},
	"lumen-window": {
		Drawing: LumenWindow,
		label: "Four radiant panes opening around a clear central field",
	},
	"form-orbit": {
		Drawing: FormOrbit,
		label: "Three rounded cobalt forms orbiting a useful central object",
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
	const { dark, light } = designSystem.preview.theme.tokens;
	const markStyle: DesignSystemMarkStyle = {
		...style,
		"--design-system-mark-background-dark": dark.background,
		"--design-system-mark-background-light": light.background,
		"--design-system-mark-foreground-dark": dark.foreground,
		"--design-system-mark-foreground-light": light.foreground,
		"--design-system-mark-primary-dark": dark.primary,
		"--design-system-mark-primary-light": light.primary,
		"--design-system-mark-primary-foreground-dark": dark.primaryForeground,
		"--design-system-mark-primary-foreground-light": light.primaryForeground,
	};

	return (
		<svg
			viewBox="0 0 64 64"
			role="img"
			aria-label={`${designSystem.name} Design System Mark`}
			aria-description={label}
			data-mark-recipe={mark.recipe}
			className={cn(styles.mark, className)}
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

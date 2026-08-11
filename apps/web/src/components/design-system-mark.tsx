import type { SVGProps } from "react";

import {
	type DesignSystem,
	type DesignSystemDiscovery,
	previewShellFor,
} from "@/lib/catalog";

type MarkDrawingProps = SVGProps<SVGSVGElement>;

function StructuralPlanes() {
	return (
		<>
			<path
				d="M11 18 32 7l21 11-21 11L11 18Z"
				fill="var(--preview-primary)"
				opacity="0.92"
			/>
			<path
				d="m11 29 21-11 21 11-21 11L11 29Z"
				fill="var(--preview-foreground)"
				opacity="0.28"
			/>
			<path
				d="m11 40 21-11 21 11-21 11L11 40Z"
				fill="var(--preview-primary)"
				opacity="0.58"
			/>
			<path
				d="m32 7 21 11-4 2-17-9-17 9-4-2L32 7Z"
				fill="white"
				opacity="0.22"
			/>
		</>
	);
}

function PageLeaves() {
	return (
		<>
			<path
				d="M12 12c9 0 16 3 20 9v32c-5-6-12-9-20-9V12Z"
				fill="var(--preview-primary)"
				opacity="0.8"
			/>
			<path
				d="M52 12c-9 0-16 3-20 9v32c5-6 12-9 20-9V12Z"
				fill="var(--preview-foreground)"
				opacity="0.32"
			/>
			<path
				d="M17 8c7 1 12 4 15 9v30c-4-5-9-8-15-9V8Z"
				fill="var(--preview-primary)"
				opacity="0.38"
			/>
			<path
				d="M32 17v36"
				stroke="var(--preview-foreground)"
				strokeWidth="1.5"
				opacity="0.55"
			/>
		</>
	);
}

function NestedApertures() {
	return (
		<>
			<rect
				x="8"
				y="8"
				width="48"
				height="48"
				rx="10"
				fill="var(--preview-foreground)"
				opacity="0.92"
			/>
			<rect
				x="15"
				y="15"
				width="34"
				height="34"
				rx="8"
				fill="var(--preview-background)"
			/>
			<rect
				x="22"
				y="22"
				width="20"
				height="20"
				rx="6"
				fill="var(--preview-primary)"
				opacity="0.82"
			/>
			<rect
				x="28"
				y="28"
				width="8"
				height="8"
				rx="3"
				fill="var(--preview-primary-foreground)"
			/>
			<path d="M12 12h36" stroke="white" strokeWidth="1.5" opacity="0.2" />
		</>
	);
}

function DirectionalNodes() {
	return (
		<>
			<path
				d="M13 45 31 15l20 14-18 20-20-4Z"
				fill="none"
				stroke="var(--preview-primary)"
				strokeWidth="5"
				strokeLinejoin="round"
			/>
			<path
				d="m31 15 2 34M13 45l38-16"
				stroke="var(--preview-foreground)"
				strokeWidth="2"
				opacity="0.48"
			/>
			<circle cx="31" cy="15" r="6" fill="var(--preview-primary)" />
			<circle cx="51" cy="29" r="6" fill="var(--preview-foreground)" />
			<circle
				cx="33"
				cy="49"
				r="6"
				fill="var(--preview-primary)"
				opacity="0.72"
			/>
			<circle
				cx="13"
				cy="45"
				r="6"
				fill="var(--preview-foreground)"
				opacity="0.72"
			/>
			<circle cx="29" cy="13" r="2" fill="white" opacity="0.42" />
		</>
	);
}

const drawings = {
	"structural-planes": StructuralPlanes,
	"page-leaves": PageLeaves,
	"nested-apertures": NestedApertures,
	"directional-nodes": DirectionalNodes,
} as const;

export function DesignSystemMark({
	designSystem,
	className,
	...props
}: {
	designSystem: DesignSystem | DesignSystemDiscovery;
} & MarkDrawingProps) {
	const { mark } =
		"releases" in designSystem
			? previewShellFor(designSystem)
			: designSystem.previewShell;
	const Drawing = drawings[mark.recipe];

	return (
		<svg
			viewBox="0 0 64 64"
			role="img"
			aria-label={`${designSystem.name} Design System Mark`}
			aria-description={mark.label}
			data-mark-recipe={mark.recipe}
			className={className}
			{...props}
		>
			<title>{`${designSystem.name} Design System Mark`}</title>
			<desc>{mark.label}</desc>
			<Drawing />
		</svg>
	);
}

export type DesignSealGeometry =
	| "arc"
	| "burst"
	| "cross"
	| "diamond"
	| "loop"
	| "orbit"
	| "split"
	| "stack"
	| "stair";

export function DesignSeal({
	className,
	geometry,
}: {
	className?: string;
	geometry: DesignSealGeometry;
}) {
	return (
		<svg
			viewBox="0 0 100 100"
			className={className}
			aria-hidden="true"
			focusable="false"
		>
			<path d="M5 6.5 93 4l3 88-89 4L4 41Z" fill="var(--brand-seal-ink)" />
			<path
				d="m10 11 78-1.5 2.5 77L12 90Z"
				fill="none"
				stroke="#fff"
				strokeWidth="2.5"
			/>
			{geometry === "arc" ? (
				<g fill="none" stroke="#fff" strokeWidth="9">
					<path d="M23 69a31 31 0 0 1 54-30" />
					<circle cx="27" cy="69" r="5" fill="#fff" stroke="none" />
				</g>
			) : null}
			{geometry === "burst" ? (
				<g fill="none" stroke="#fff" strokeWidth="7">
					<path d="m50 18 1 64M18 49l64 2M27 27l46 46M73 27 27 73" />
				</g>
			) : null}
			{geometry === "cross" ? (
				<path d="M40 18h20v22h22v20H60v22H40V60H18V40h22Z" fill="#fff" />
			) : null}
			{geometry === "diamond" ? (
				<g fill="none" stroke="#fff" strokeWidth="7">
					<path d="m50 17 31 33-31 33-31-33Z" />
					<circle cx="50" cy="50" r="9" fill="#fff" stroke="none" />
				</g>
			) : null}
			{geometry === "loop" ? (
				<g fill="none" stroke="#fff" strokeWidth="8">
					<circle cx="38" cy="50" r="21" />
					<circle cx="62" cy="50" r="21" />
				</g>
			) : null}
			{geometry === "orbit" ? (
				<g fill="none" stroke="#fff" strokeWidth="7">
					<ellipse
						cx="50"
						cy="50"
						rx="34"
						ry="18"
						transform="rotate(-28 50 50)"
					/>
					<circle cx="50" cy="50" r="8" fill="#fff" stroke="none" />
				</g>
			) : null}
			{geometry === "split" ? (
				<g fill="#fff">
					<path d="M18 22h34L18 78Z" />
					<path d="M82 78H48l34-56Z" />
				</g>
			) : null}
			{geometry === "stack" ? (
				<g fill="none" stroke="#fff" strokeWidth="7">
					<rect
						x="23"
						y="20"
						width="45"
						height="45"
						transform="rotate(-8 45.5 42.5)"
					/>
					<rect
						x="32"
						y="35"
						width="45"
						height="45"
						transform="rotate(7 54.5 57.5)"
					/>
				</g>
			) : null}
			{geometry === "stair" ? (
				<path d="M18 68h20V53h20V38h24v30Z" fill="#fff" />
			) : null}
		</svg>
	);
}

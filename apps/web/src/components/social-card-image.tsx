import { ImageResponse } from "next/og";

import { canonicalUrl, type SocialCardDefinition } from "@/lib/social-metadata";

const cardSize = {
	width: 1200,
	height: 630,
} as const;

function linearToSrgb(value: number) {
	const encoded =
		value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
	return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
}

function imageSafeColor(color: string) {
	const match = color.match(
		/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)$/,
	);
	if (!match) return color;

	const lightness = Number(match[1]);
	const chroma = Number(match[2]);
	const hue = (Number(match[3]) * Math.PI) / 180;
	const a = chroma * Math.cos(hue);
	const b = chroma * Math.sin(hue);
	const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
	const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
	const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
	const l = lRoot ** 3;
	const m = mRoot ** 3;
	const s = sRoot ** 3;
	const red = linearToSrgb(
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
	);
	const green = linearToSrgb(
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
	);
	const blue = linearToSrgb(
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	);
	return `rgb(${red}, ${green}, ${blue})`;
}

function AgentKogeiMark({ color }: { color: string }) {
	return (
		<svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
			<path
				d="M4 21 21 4l17 17-17 17L4 21Z"
				fill="none"
				stroke={color}
				strokeWidth="3"
			/>
			<path d="M12 21h18M21 12v18" fill="none" stroke={color} strokeWidth="3" />
		</svg>
	);
}

function DesignSystemMark({
	recipe,
	color,
}: {
	recipe: NonNullable<SocialCardDefinition["visualIdentity"]>["markRecipe"];
	color: string;
}) {
	const shared = {
		fill: "none",
		stroke: color,
		strokeWidth: 3,
	} as const;

	return (
		<svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
			{recipe === "structural-planes" ? (
				<g>
					<path d="M110 18 172 54v72l-62 36-62-36V54l62-36Z" {...shared} />
					<path
						d="m48 54 62 36 62-36M110 90v72"
						fill="none"
						stroke={color}
						strokeWidth="3"
					/>
					<path d="M110 90 172 54v72l-62 36V90Z" fill={color} opacity="0.28" />
				</g>
			) : null}
			{recipe === "page-leaves" ? (
				<g>
					<path
						d="M110 18c49 17 72 55 58 96-10 31-34 54-58 70-24-26-40-58-39-91 0-34 14-60 39-75Z"
						{...shared}
					/>
					<path
						d="M110 18c-16 45-15 95 0 166"
						fill="none"
						stroke={color}
						strokeWidth="4"
					/>
					<path
						d="M110 18c-49 17-72 55-58 96 10 31 34 54 58 70"
						fill={color}
						stroke={color}
						strokeWidth="3"
						opacity="0.68"
					/>
				</g>
			) : null}
			{recipe === "nested-apertures" ? (
				<g>
					<rect x="24" y="24" width="172" height="172" rx="42" {...shared} />
					<rect
						x="58"
						y="58"
						width="104"
						height="104"
						rx="28"
						fill="none"
						stroke={color}
						strokeWidth="10"
					/>
					<rect x="91" y="91" width="38" height="38" rx="8" fill={color} />
				</g>
			) : null}
			{recipe === "directional-nodes" ? (
				<g>
					<path
						d="m110 18 28 48 56 2-28 48 25 50-56 1-25 35-25-35-56-1 25-50-28-48 56-2 28-48Z"
						{...shared}
					/>
					<circle cx="110" cy="110" r="30" fill={color} />
					<circle
						cx="110"
						cy="110"
						r="14"
						fill="none"
						stroke={color}
						strokeWidth="3"
					/>
				</g>
			) : null}
			{recipe === "relay-loop" ? (
				<g>
					{[0, 90, 180, 270].map((rotation) => (
						<g key={rotation} transform={`rotate(${rotation} 110 110)`}>
							<path
								d="M42 28h68c36 0 65 24 76 61l-31 10c-7-24-24-38-47-38H42V28Z"
								fill={color}
								stroke={color}
								strokeWidth="3"
							/>
						</g>
					))}
					<rect
						x="96"
						y="96"
						width="28"
						height="28"
						rx="6"
						fill="none"
						stroke={color}
						strokeWidth="3"
					/>
				</g>
			) : null}
			{recipe === "pulse-sequence" ? (
				<g>
					<path
						d="m42 165 45-30 45-30 45-30"
						fill="none"
						stroke={color}
						strokeWidth="8"
						strokeLinejoin="bevel"
					/>
					{[
						{ x: 27, y: 150, opacity: 0.58 },
						{ x: 72, y: 120, opacity: 0.82 },
						{ x: 117, y: 90, opacity: 1 },
						{ x: 162, y: 60, opacity: 0.82 },
					].map(({ x, y, opacity }) => (
						<rect
							key={`${x}-${y}`}
							x={x}
							y={y}
							width="30"
							height="30"
							rx="4"
							fill={color}
							stroke={color}
							strokeWidth="3"
							opacity={opacity}
						/>
					))}
					<path d="M177 60h20v20" fill="none" stroke={color} strokeWidth="7" />
				</g>
			) : null}
		</svg>
	);
}

export function renderSocialCard(card: SocialCardDefinition) {
	const visual = card.visualIdentity;
	const background = imageSafeColor(visual?.background ?? "#0b0d12");
	const foreground = imageSafeColor(visual?.foreground ?? "#f5f7fa");
	const primary = imageSafeColor(visual?.primary ?? "#ffbd59");
	const primaryForeground = imageSafeColor(
		visual?.primaryForeground ?? "#0b0d12",
	);
	const pageUrl = canonicalUrl(card);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				position: "relative",
				overflow: "hidden",
				background,
				color: foreground,
				padding: "58px 68px 52px",
				fontFamily: "Arial, Helvetica, sans-serif",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					width: 420,
					height: 420,
					borderLeft: `1px solid ${foreground}`,
					borderBottom: `1px solid ${foreground}`,
					opacity: 0.12,
				}}
			/>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					fontSize: 24,
					fontWeight: 700,
					letterSpacing: "-0.02em",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<AgentKogeiMark color={primary} />
					<span>AgentKogei</span>
				</div>
				<span style={{ color: primary, fontSize: 18, letterSpacing: "0.08em" }}>
					{card.eyebrow.toUpperCase()}
				</span>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 64,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 22,
						maxWidth: visual ? 760 : 980,
					}}
				>
					<div
						style={{
							width: 88,
							height: 8,
							background: primary,
						}}
					/>
					<h1
						style={{
							margin: 0,
							fontSize: visual ? 70 : 76,
							lineHeight: 0.98,
							letterSpacing: "-0.055em",
							fontWeight: 700,
						}}
					>
						{card.heading}
					</h1>
					<p
						style={{
							margin: 0,
							fontSize: 27,
							lineHeight: 1.35,
							opacity: 0.78,
						}}
					>
						{card.description}
					</p>
				</div>

				{visual ? (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 272,
							height: 272,
							border: `2px solid ${foreground}`,
							background: primary,
						}}
					>
						<DesignSystemMark
							recipe={visual.markRecipe}
							color={primaryForeground}
						/>
					</div>
				) : null}
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: `1px solid ${foreground}`,
					paddingTop: 24,
					fontSize: 19,
					opacity: 0.72,
				}}
			>
				<span>{pageUrl.replace("https://", "")}</span>
				<span>
					{visual ? `${visual.identity}@${visual.release}` : card.eyebrow}
				</span>
			</div>
		</div>,
		{
			...cardSize,
			headers: {
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		},
	);
}

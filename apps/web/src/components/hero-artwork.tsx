import { DesignSeal, type DesignSealGeometry } from "./design-seal";

const fieldMarks = [
	{ className: "field-mark-1", geometry: "arc" },
	{ className: "field-mark-2", geometry: "cross" },
	{ className: "field-mark-3", geometry: "orbit" },
	{ className: "field-mark-4", geometry: "stair" },
	{ className: "field-mark-5", geometry: "split" },
	{ className: "field-mark-6", geometry: "burst" },
	{ className: "field-mark-7", geometry: "loop" },
	{ className: "field-mark-8", geometry: "stack" },
	{ className: "field-mark-9", geometry: "diamond" },
] as const satisfies readonly {
	className: string;
	geometry: DesignSealGeometry;
}[];

export function HeroArtwork({ className }: { className?: string }) {
	return (
		<div className={`hero-artwork ${className ?? ""}`} aria-hidden="true">
			<div className="hero-artwork-grid" />
			<div className="hero-seal-field">
				{fieldMarks.map(({ className: markClassName, geometry }) => (
					<DesignSeal
						key={markClassName}
						geometry={geometry}
						className={`hero-field-mark hero-artwork-piece ${markClassName}`}
					/>
				))}
			</div>
		</div>
	);
}

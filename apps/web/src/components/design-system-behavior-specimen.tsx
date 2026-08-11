"use client";

import { Button } from "@agentkogei/ui/components/button";
import { type CSSProperties, useState } from "react";

import { DesignSystemSpecimenHeading } from "@/components/design-system-specimen-heading";
import type { PreviewShell } from "@/lib/catalog";

type Motion = NonNullable<PreviewShell["motion"]>;
type ReducedMotion = NonNullable<PreviewShell["reducedMotion"]>;
type Accessibility = NonNullable<PreviewShell["accessibility"]>;

const accessibilityTopics = [
	["semantics", "Semantics"],
	["keyboard", "Keyboard"],
	["focus", "Focus"],
	["contrast", "Contrast"],
	["targetSize", "Target size"],
	["zoom", "Zoom"],
	["reflow", "Reflow"],
	["forcedColors", "Forced colors"],
	["statusCommunication", "Status communication"],
] as const satisfies ReadonlyArray<
	readonly [Exclude<keyof Accessibility, "standard">, string]
>;

export function DesignSystemBehaviorSpecimen({
	accessibility,
	composition,
	motion,
	name,
	reducedMotion,
}: {
	accessibility: Accessibility;
	composition: PreviewShell["composition"];
	motion: Motion;
	name: string;
	reducedMotion: ReducedMotion;
}) {
	const [motionComplete, setMotionComplete] = useState(false);
	const motionStyle = {
		"--preview-motion-distance": `${motion.movement.distanceRem}rem`,
		"--preview-motion-duration": `${motion.durationMs.spatial}ms`,
		"--preview-motion-easing": motion.easing.move,
		"--preview-motion-scale": motion.movement.scaleFrom,
	} as CSSProperties;

	return (
		<section
			aria-label={`${name} motion and accessibility`}
			data-behavior-composition={composition}
			data-specimen-composition={composition}
			className="grid gap-12"
		>
			<article
				className="preview-control-section"
				data-behavior-section="motion"
			>
				<DesignSystemSpecimenHeading
					number="13"
					title="Motion and reduced motion"
					description="Timing supports state changes and never starts without a Builder action."
				/>
				<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
					<fieldset className="preview-motion-specimen catalog-preview-panel flex flex-col gap-5 border p-5">
						<legend className="sr-only">Motion specimen</legend>
						<div className="preview-motion-stage border p-4">
							<div
								className="preview-motion-object catalog-preview-primary grid min-h-20 w-36 place-items-center rounded-[var(--preview-radius)] p-3 text-center text-xs"
								data-motion-state={motionComplete ? "settled" : "ready"}
								style={motionStyle}
							>
								{motionComplete ? "State settled" : "Ready to move"}
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button
								type="button"
								onClick={() => setMotionComplete((complete) => !complete)}
							>
								Demonstrate motion
							</Button>
							<p
								role="status"
								aria-label="Motion specimen state"
								className="text-muted-foreground text-sm"
							>
								{motionComplete
									? "The movement settled in its labelled end state."
									: "The specimen is ready and does not autoplay."}
							</p>
						</div>
					</fieldset>

					<div className="catalog-preview-panel flex flex-col gap-5 border p-5">
						<div>
							<h4 className="font-medium">Motion timings</h4>
							<dl className="mt-3 grid gap-2 text-sm">
								{Object.entries(motion.durationMs).map(([label, value]) => (
									<div key={label} className="flex justify-between gap-4">
										<dt className="capitalize">{label}</dt>
										<dd className="font-mono">{value} ms</dd>
									</div>
								))}
							</dl>
						</div>
						<p className="text-muted-foreground text-sm leading-6">
							{motion.guidance}
						</p>
						<div className="border-t pt-4">
							<h4 className="font-medium">Reduced motion</h4>
							<p className="mt-2 text-muted-foreground text-sm leading-6">
								{reducedMotion.guidance}
							</p>
						</div>
					</div>
				</div>
			</article>

			<article
				className="preview-control-section"
				data-behavior-section="accessibility"
			>
				<DesignSystemSpecimenHeading
					number="14"
					title="Accessibility guidance"
					description="Complete accessibility direction for the Design System Preview."
				/>
				<ul
					aria-label="Accessibility guidance topics"
					className="grid gap-px border bg-border md:grid-cols-2 xl:grid-cols-3"
				>
					{accessibilityTopics.map(([key, label]) => (
						<li key={key} className="catalog-preview-surface p-5">
							<h4 className="font-medium">{label}</h4>
							<p className="mt-2 text-muted-foreground text-sm leading-6">
								{accessibility[key]}
							</p>
						</li>
					))}
				</ul>
			</article>
		</section>
	);
}

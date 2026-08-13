import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { DesignContractLink } from "@/components/design-contract-link";
import {
	type InstallableDesignSystem,
	InstallationCommand,
} from "@/components/installation-command";
import { currentRelease, designSystems } from "@/lib/catalog";
import {
	consistentAiUiGuide,
	guideMetadata,
	guideStructuredData,
} from "@/lib/guides";
import { StructuredData } from "@/lib/structured-data";

function firstDesignSystem() {
	const designSystem = designSystems.at(0);
	if (!designSystem) {
		throw new Error("The consistent AI interface guide needs a Design System");
	}
	return designSystem;
}

const exampleDesignSystem = firstDesignSystem();
const exampleRelease = currentRelease(exampleDesignSystem);
const guideInstallationChoice: readonly InstallableDesignSystem[] = [
	{
		slug: exampleDesignSystem.slug,
		name: exampleDesignSystem.name,
	},
];

export const metadata: Metadata = guideMetadata(consistentAiUiGuide);

const structuredData = guideStructuredData(consistentAiUiGuide);

const comparisonApproaches = [
	{
		title: "Repeated prompts",
		body: "A repeated request can remind one agent about a preference, but it must be reconstructed in every session. Small wording and context changes make it temporary direction, not a complete shared source of truth.",
	},
	{
		title: "Themes",
		body: "A theme usually supplies colors, type, or surface treatment. It does not tell an agent how layouts, components, states, responsive behavior, motion, accessibility, and product surfaces should work together.",
	},
	{
		title: "Component libraries",
		body: "A component library gives agents reusable parts. It rarely decides which parts fit the product, how to compose them, what hierarchy to establish, or how complete journeys should behave.",
	},
	{
		title: "Automatic redesign",
		body: "Automatic redesign changes an existing interface. Durable direction instead governs future agent work while leaving the Builder in control of whether and when existing screens change.",
	},
	{
		title: "Complete Design System",
		body: "A complete Design System connects principles, tokens, typography, layout, components, states, motion, accessibility, responsive behavior, examples, and validation. Its Design Contract is the inspectable root DESIGN.md artifact that gives this complete direction to agents in the Project.",
	},
] as const;

const evaluationSteps = [
	{
		label: "01 / Direction",
		title: `Open the ${exampleDesignSystem.name} Design System Preview`,
		body: "Inspect its intended fit, visual direction, foundations, component behavior, and representative product surfaces.",
		href: exampleDesignSystem.preview.route,
		analytics: null,
	},
	{
		label: "02 / Evidence",
		title: `Review ${exampleDesignSystem.name} public evidence`,
		body: "Check its release metadata, validation, responsive coverage, color schemes, reduced motion, and accessibility evidence for the reference implementation.",
		href: `${exampleDesignSystem.preview.route}#release-details-heading`,
		analytics: null,
	},
	{
		label: "03 / Complete direction",
		title: `Inspect the ${exampleDesignSystem.name} Design Contract`,
		body: `Read the exact ${exampleDesignSystem.name} ${exampleRelease.version} Design Contract to judge the actual agent direction rather than relying on the visual specimen alone.`,
		href: `/contracts/${exampleDesignSystem.slug}/${exampleRelease.version}`,
		analytics: {
			designSystem: exampleDesignSystem.slug,
			surface: "guide",
		},
	},
] as const;

export default function ConsistentAiUiGuidePage() {
	return (
		<main>
			<StructuredData identity="guide-consistent-ai-ui" data={structuredData} />
			<article>
				<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<Link
							href={"/guides" as Route}
							className="w-fit font-mono text-muted-foreground text-xs uppercase tracking-[0.16em] transition-colors hover:text-foreground"
						>
							Guides / Consistent AI interfaces
						</Link>
						<h1 className="max-w-4xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-8xl">
							Keep AI generated interfaces consistent.
						</h1>
						<p className="max-w-3xl text-pretty text-muted-foreground text-xl leading-9">
							An individually plausible screen can still drift from the rest of
							a Project. Consistency comes from durable Project level direction
							that every agent can inspect and apply.
						</p>
					</div>
				</header>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="drift-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]">
						<div className="flex flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Why drift happens
							</p>
							<h2
								id="drift-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Plausible choices do not add up to one coherent product.
							</h2>
						</div>
						<div className="flex flex-col gap-6 text-lg leading-8">
							<p>
								An agent works from the current request, the files it can see,
								and the patterns it happens to notice. That can produce a
								credible screen without preserving the decisions made elsewhere.
							</p>
							<p className="text-muted-foreground">
								When spacing, hierarchy, states, responsive behavior, and
								component choices are inferred again for each task, each answer
								can be locally reasonable while the Project gradually loses a
								shared visual and behavioral language.
							</p>
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="comparison-heading"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-10">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								What solves which part
							</p>
							<h2
								id="comparison-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Choose complete direction, not another temporary input.
							</h2>
						</div>
						<div className="grid gap-px border bg-border md:grid-cols-2 lg:grid-cols-5">
							{comparisonApproaches.map((approach) => (
								<section key={approach.title} className="bg-background p-6">
									<h3 className="font-medium text-xl tracking-tight">
										{approach.title}
									</h3>
									<p className="mt-4 text-muted-foreground text-sm leading-6">
										{approach.body}
									</p>
								</section>
							))}
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="evaluation-heading"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-10">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Inspect before choosing
							</p>
							<h2
								id="evaluation-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Evaluate the direction, evidence, and complete artifact.
							</h2>
							<p className="mt-5 text-muted-foreground leading-7">
								Start by comparing every{" "}
								<Link
									href={"/design-systems" as Route}
									className="font-medium text-foreground underline underline-offset-4"
								>
									Design System Preview
								</Link>
								. The path below follows {exampleDesignSystem.name} from its
								Preview through evidence and exact direction so the final
								command stays qualified.
							</p>
						</div>
						<ol
							aria-label="Evaluate before Installation"
							className="grid border-t border-l lg:grid-cols-3"
						>
							{evaluationSteps.map((step, index) => (
								<li
									key={step.title}
									className="flex flex-col gap-5 border-r border-b p-6 sm:p-8"
								>
									<div className="flex items-center justify-between gap-4">
										<span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
											{step.label}
										</span>
										{index < evaluationSteps.length - 1 ? (
											<ArrowRight
												className="hidden size-4 text-muted-foreground lg:block"
												aria-hidden="true"
											/>
										) : null}
									</div>
									<h3 className="font-medium text-xl tracking-tight">
										{step.analytics ? (
											<DesignContractLink
												href={step.href as Route}
												designSystem={step.analytics.designSystem}
												surface={step.analytics.surface}
												className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
											>
												{step.title}
												<ArrowUpRight className="size-4" aria-hidden="true" />
											</DesignContractLink>
										) : (
											<Link
												href={step.href as Route}
												className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
											>
												{step.title}
												<ArrowUpRight className="size-4" aria-hidden="true" />
											</Link>
										)}
									</h3>
									<p className="text-muted-foreground leading-7">{step.body}</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section
					className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="installation-heading"
				>
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Qualified Installation
							</p>
							<h2
								id="installation-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Install only after the fit is clear.
							</h2>
						</div>
						<p className="max-w-3xl text-lg text-muted-foreground leading-8">
							Installation places the complete selected release at the Project
							root and makes it discoverable through Project instructions. It
							does not redesign an existing interface, install dependencies, or
							replace the Builder&apos;s approval of file changes.
						</p>
						<InstallationCommand
							designSystems={guideInstallationChoice}
							guide="consistent-ai-ui"
						>
							This command keeps the {exampleDesignSystem.name} direction
							inspected above. Run it from the Project root after confirming the
							fit.
						</InstallationCommand>
					</div>
				</section>
			</article>
		</main>
	);
}

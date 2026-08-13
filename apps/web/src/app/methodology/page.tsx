import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import {
	agentKogeiOrganization,
	publicOrigin,
	StructuredData,
} from "@/lib/structured-data";

const title = "Design System Evaluation methodology | AgentKogei";
const description =
	"How AgentKogei authors, evaluates, publishes, versions, licenses, retrieves, and installs Design Systems.";
const canonicalUrl = `${publicOrigin}/methodology`;

export const metadata: Metadata = {
	title,
	description,
	alternates: {
		canonical: "/methodology",
	},
	robots: {
		index: true,
		follow: true,
	},
};

const methodologyStructuredData = {
	"@context": "https://schema.org",
	"@type": "TechArticle",
	"@id": `${canonicalUrl}#article`,
	name: "Design System Evaluation methodology",
	headline: "Design System Evaluation methodology",
	description,
	url: canonicalUrl,
	datePublished: "2026-08-13",
	dateModified: "2026-08-13",
	author: agentKogeiOrganization,
	publisher: {
		"@id": agentKogeiOrganization["@id"],
	},
	mainEntityOfPage: canonicalUrl,
	about: [
		"Design System Evaluation",
		"Design System Releases",
		"Design Contract Installation",
	],
};

const currentWorkflow = [
	{
		title: "1. Inspect the Design Reference",
		body: "A maintainer supplied image or public URL establishes broad visual direction. AgentKogei inspects it for useful principles without copying product identity, proprietary assets, distinctive compositions, or a living designer's style.",
	},
	{
		title: "2. Author one final release",
		body: "The Design System Addition creates an original Design Contract, structured Preview data, a Design System Mark, publication metadata, and generation evidence for one final 1.0 release.",
	},
	{
		title: "3. Evaluate the reference implementation",
		body: "Design System Evaluation checks required screens, responsive viewports, light and dark color schemes, reduced motion, automated validation, and public evidence. Accessibility evaluation targets WCAG 2.2 Level AA for the reference implementation.",
	},
	{
		title: "4. Validate the publication record",
		body: "Generation blocks when metadata is invalid, evidence is missing, the Design Contract digest changes, a release identity is duplicated, required Preview values are absent, or unexpected release files appear.",
	},
	{
		title: "5. Publish by merging",
		body: "A pull request exposes the complete change for maintainer review. Merge to the main branch is the publication boundary and triggers production deployment. A failed validation result prevents completion.",
	},
] as const;

const retiredTerms = [
	{
		term: "Candidate Design System Release",
		description:
			"An unpublished release in the retired gated workflow. Current Design System Additions create one final release in isolation until its pull request is merged.",
	},
	{
		term: "Authoring Approval",
		description:
			"The retired gate that accepted creative direction without claiming evaluation or publication. The current workflow has no separate Authoring Approval state.",
	},
	{
		term: "Publication Approval",
		description:
			"The retired gate that authorized admission to the Design Systems collection. Current publication is authorized by merging the validated pull request, not by a separate Publication Approval record.",
	},
] as const;

export default function MethodologyPage() {
	return (
		<main>
			<StructuredData identity="methodology" data={methodologyStructuredData} />

			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:items-end">
					<div className="flex flex-col gap-6">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Trust and evidence
						</p>
						<h1 className="text-balance font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
							Design System Evaluation methodology
						</h1>
					</div>
					<p className="max-w-xl text-pretty text-lg text-muted-foreground leading-8">
						AgentKogei publishes inspectable evidence and complete Design
						Contracts so a Builder can judge a Design System before
						Installation. The process establishes traceable facts without
						promising a particular result in every Project.
					</p>
				</div>
			</header>

			<section
				className="border-b px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="workflow-heading"
			>
				<div className="mx-auto max-w-7xl">
					<div className="mb-10 max-w-3xl">
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Current workflow
						</p>
						<h2
							id="workflow-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							One evidence backed path to publication.
						</h2>
					</div>
					<ol className="grid gap-px border bg-border lg:grid-cols-5">
						{currentWorkflow.map((step) => (
							<li key={step.title} className="bg-background p-6">
								<h3 className="font-medium leading-6">{step.title}</h3>
								<p className="mt-4 text-muted-foreground text-sm leading-6">
									{step.body}
								</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section
				className="border-b px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="claims-heading"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
					<div>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							What evaluation means
						</p>
						<h2
							id="claims-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Evidence, not a blanket guarantee.
						</h2>
					</div>
					<div className="grid gap-8 text-muted-foreground leading-7 sm:grid-cols-2">
						<div>
							<h3 className="font-medium text-foreground">
								Generation evidence
							</h3>
							<p className="mt-3">
								The publication record identifies agent generation runs,
								required surfaces, viewports, color schemes, automated checks,
								and evidence paths. Published files remain open for inspection.
							</p>
						</div>
						<div>
							<h3 className="font-medium text-foreground">
								Automated validation
							</h3>
							<p className="mt-3">
								Validation proves that required publication data and evidence
								exist, that the fixed Design Contract digest matches, and that
								the release meets the repository contract. It does not judge
								every future use.
							</p>
						</div>
						<div>
							<h3 className="font-medium text-foreground">
								Accessibility scope
							</h3>
							<p className="mt-3">
								Evaluation covers a reference implementation against WCAG 2.2
								Level AA expectations. It does not claim that every resulting
								interface conforms. A Builder remains responsible for testing
								the interface and content produced in the Project.
							</p>
						</div>
						<div>
							<h3 className="font-medium text-foreground">Human review</h3>
							<p className="mt-3">
								Older evaluation records may identify a separate human review
								and rights review. The current workflow exposes a pull request
								for maintainer review but does not require or imply an
								independent human approval record.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section
				className="border-b px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="language-heading"
			>
				<div className="mx-auto max-w-7xl">
					<div className="mb-10 max-w-3xl">
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Workflow language
						</p>
						<h2
							id="language-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Current facts and retired gates.
						</h2>
						<p className="mt-5 text-muted-foreground leading-7">
							The earlier gated process used three explicit states that have
							precise historical meanings. They are not claims about the current
							Design System Addition workflow.
						</p>
					</div>
					<dl className="grid gap-px border bg-border lg:grid-cols-3">
						{retiredTerms.map((item) => (
							<div key={item.term} className="bg-background p-6">
								<dt className="font-medium">{item.term}</dt>
								<dd className="mt-3 text-muted-foreground text-sm leading-6">
									{item.description}
								</dd>
							</div>
						))}
					</dl>
					<div className="mt-px grid gap-px border bg-border md:grid-cols-3">
						<div className="bg-background p-6">
							<h3 className="font-medium">Design System Evaluation</h3>
							<p className="mt-3 text-muted-foreground text-sm leading-6">
								The current evidence record for generation, validation,
								accessibility scope, and the immutable Design Contract.
							</p>
						</div>
						<div className="bg-background p-6">
							<h3 className="font-medium">Published Design System</h3>
							<p className="mt-3 text-muted-foreground text-sm leading-6">
								A final release whose validated files have been merged into the
								Design Systems source. Before merge, it is not published.
							</p>
						</div>
						<div className="bg-background p-6">
							<h3 className="font-medium">Installation</h3>
							<p className="mt-3 text-muted-foreground text-sm leading-6">
								The declarative application of one Published Design System to a
								Project through its root Design Contract. Installation is not
								publication or redesign.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section
				className="border-b px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="releases-heading"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
					<div>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Releases and rights
						</p>
						<h2
							id="releases-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Stable versions, open terms.
						</h2>
					</div>
					<div className="grid gap-8 sm:grid-cols-2">
						<div>
							<h3 className="font-medium">Immutable two part releases</h3>
							<p className="mt-3 text-muted-foreground leading-7">
								Every Design System Release uses a two part major.minor version.
								A minor release adds compatible direction. A major release may
								change visual or behavioral direction in breaking ways. There is
								no patch release category, and an exact release keeps the same
								Design Contract bytes.
							</p>
						</div>
						<div>
							<h3 className="font-medium">MIT License</h3>
							<p className="mt-3 text-muted-foreground leading-7">
								The repository and every Published Design System are MIT
								licensed. Builders may use, copy, modify, distribute,
								sublicense, or sell copies under those terms. AgentKogei
								publishes only original direction or material it has the right
								to use.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section
				className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
				aria-labelledby="retrieval-heading"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
					<div>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							Retrieval and Installation
						</p>
						<h2
							id="retrieval-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Public by design. Private by default.
						</h2>
					</div>
					<div className="flex flex-col gap-6">
						<p className="text-muted-foreground leading-7">
							The Design Systems collection is public and stateless. Current and
							exact Design System Releases can be inspected and retrieved
							without an account or authorization. The web application keeps no
							persistent application state.
						</p>
						<p className="text-muted-foreground leading-7">
							The CLI sends only the requested Design Contract selector. It
							sends no Project name, path, Git remote, file content, prompt,
							generated interface, or dependency list. The installed root
							DESIGN.md works offline without AgentKogei or network access.
						</p>
						<p className="text-muted-foreground leading-7">
							Installation places the complete Design Contract at the Project
							root and may maintain one marked AGENTS.md reference so agents can
							find it. It does not redesign an existing interface, execute the
							direction, add hidden state, or manage future releases.
						</p>
						<div className="pt-2">
							<Link
								href={"/design-systems" as Route}
								className={buttonVariants({ size: "lg" })}
							>
								Inspect Published Design Systems
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

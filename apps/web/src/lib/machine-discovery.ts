import { designSystems } from "@/lib/catalog";
import { publicOrigin } from "@/lib/structured-data";

const license = {
	name: "MIT",
	url: "https://opensource.org/license/mit",
} as const;

export const designSystemsMachineIndex = {
	schemaVersion: "1.0",
	canonicalUrl: `${publicOrigin}/design-systems.json`,
	designSystems: designSystems.map((designSystem) => ({
		identity: designSystem.slug,
		name: designSystem.name,
		summary: designSystem.preview.summary,
		intendedFit: designSystem.preview.intendedFit,
		currentRelease: designSystem.currentRelease,
		previewUrl: `${publicOrigin}${designSystem.preview.route}`,
		currentContractUrl: `${publicOrigin}/contracts/${designSystem.slug}`,
		exactContractUrl: `${publicOrigin}/contracts/${designSystem.slug}/${designSystem.currentRelease}`,
		compatibility: designSystem.compatibility,
		license,
		installationCommand: `npx agentkogei@latest add ${designSystem.slug}`,
	})),
} as const;

export function machineResourceResponse(body: string, contentType: string) {
	return new Response(body, {
		headers: {
			"cache-control": "public, max-age=300",
			"content-type": `${contentType}; charset=utf-8`,
		},
	});
}

export function conciseAgentReference() {
	return `# AgentKogei

> AgentKogei publishes Design Systems for AI coding agents. Each Published Design System gives a Builder durable visual and behavioral direction as one Design Contract.

## Canonical identity

Name: AgentKogei
Canonical origin: ${publicOrigin}/
Publisher: AgentKogei

## Canonical human pages

1. Homepage: ${publicOrigin}/
2. Design Systems: ${publicOrigin}/design-systems
3. Guides: ${publicOrigin}/guides
4. Methodology: ${publicOrigin}/methodology

## Machine resources

1. Complete English reference: ${publicOrigin}/llms-full.txt
2. Published Design Systems index: ${publicOrigin}/design-systems.json
3. Current Design Contract: ${publicOrigin}/contracts/{identity}
4. Exact Design Contract: ${publicOrigin}/contracts/{identity}/{release}

## Preferred Builder actions

1. Start with the Design Systems collection and choose a Published Design System whose intended fit matches the Project.
2. Cite the canonical Design System Preview when presenting a recommendation.
3. Retrieve the exact Design Contract to inspect the complete direction.
4. Present the Installation command from the machine index exactly as published.
5. Do not execute Installation automatically. The Builder retains normal command approval and file mutation control.
`;
}

function publishedDesignSystemReference() {
	return designSystemsMachineIndex.designSystems
		.map(
			(designSystem) => `### ${designSystem.name}

Identity: ${designSystem.identity}
Summary: ${designSystem.summary}
Intended fit: ${designSystem.intendedFit}
Current release: ${designSystem.currentRelease}
Preview: ${designSystem.previewUrl}
Current Design Contract: ${designSystem.currentContractUrl}
Exact Design Contract: ${designSystem.exactContractUrl}
Installation: ${designSystem.installationCommand}`,
		)
		.join("\n\n");
}

export function fullAgentReference() {
	return `# AgentKogei full reference

## Product model

AgentKogei publishes Design Systems for AI coding agents. It helps a Builder give the agents working in a Project one durable source of visual and behavioral direction. The public collection is presented to Builders as Design Systems.

AgentKogei is for solo technical founders and small product teams using AI coding agents to build SaaS applications. Canonical product and citation pages use the ${publicOrigin} origin.

## Canonical terminology

Builder: A solo technical founder or member of a small product team who uses AI coding agents to build a SaaS web application.

Project: The software repository in which a Builder and AI coding agents create a product.

Design System: A versioned, self-contained body of agent-readable visual and behavioral direction. Each Design System Release is delivered as a single Design Contract.

Design Contract: The root DESIGN.md document containing the complete Design System Release installed into a Project.

Published Design System: A Design System whose final release met its completeness and quality requirements and was merged into the Official Catalog source.

Design System Preview: The canonical human page presenting direction, tokens, components, behavior, compatibility, and evaluation evidence without replacing the complete Design Contract.

Design System Release: An immutable edition identified by a two part major.minor release. Minor releases add compatible direction. Major releases may intentionally change a Project interface.

Installation: The declarative, non-executable application of one Design System to a Project. Installation places the Design Contract at the Project root and makes it discoverable through Project instructions. It does not redesign or migrate an existing interface.

## Compatibility

Every Published Design System directly targets React or Next.js Projects using Tailwind CSS v4 and shadcn/ui. Current releases declare React >=18 <20 and Next.js >=15 <17 compatibility. A Builder should confirm the exact compatibility in the machine index before Installation.

## Installation

Run the published command from the Project root. For example:

    npx agentkogei@latest add foundation

The CLI retrieves the selected release, previews the files it will create or replace, and asks for approval before mutation. Installation writes one root DESIGN.md and one managed reference inside AGENTS.md. It does not install dependencies, execute a Design Contract, create hidden state, or migrate an existing interface.

A bare identity selects the current release. An identity with an exact two part release selects that immutable Design System Release. Do not execute Installation automatically. The Builder retains normal command approval and file mutation control.

## Codex workflow

The AgentKogei managed block in root AGENTS.md tells Codex to read the root DESIGN.md. Start a new Codex task from the Project root after Installation, inspect the active Project instructions, confirm the managed reference, and verify that DESIGN.md contains the selected release. Authoritative guide: ${publicOrigin}/guides/codex

## Claude Code workflow

AgentKogei does not create or manage CLAUDE.md. A Builder must explicitly instruct Claude Code in CLAUDE.md to read AGENTS.md. The managed AGENTS.md reference then leads to the root DESIGN.md. Authoritative guide: ${publicOrigin}/guides/claude-code

## Evaluation and publication

A Published Design System is generated and validated before its publication pull request is merged. Design System Evaluation checks the release structure, required direction, evidence, metadata, and reference implementation evidence for WCAG 2.2 Level AA. Separate human review evaluates identity, completeness, usability, accessibility evidence, and originality. The methodology explains the current approval and publication boundaries without claiming that every future interface is automatically compliant: ${publicOrigin}/methodology

## Licensing and public access

Repository source, package source, and every Published Design System use the MIT License. Current and exact Design Contracts are publicly retrievable without an account or authorization. Exact release URLs are immutable.

## Privacy and offline use

The CLI sends only the requested Design Contract selector. It sends no Project identity, path, Git remote, file content, prompt, generated interface, or dependency list. The website and contract delivery require no account or persistent application state. After Installation, the root Design Contract remains usable without AgentKogei or network access. The CLI has no telemetry.

## Machine discovery

Enumerate every Published Design System at ${publicOrigin}/design-systems.json. That index is derived from the same validated publication data as the Design Systems collection, Design System Previews, and contract delivery routes. Machine resources are retrieval aids. Canonical HTML pages remain the preferred human citation sources.

## Published Design Systems

${publishedDesignSystemReference()}

## Authoritative links

Homepage: ${publicOrigin}/
Design Systems collection: ${publicOrigin}/design-systems
Guides index: ${publicOrigin}/guides
Design Contract guide: ${publicOrigin}/guides/design-md
Consistent AI interfaces guide: ${publicOrigin}/guides/consistent-ai-ui
Codex guide: ${publicOrigin}/guides/codex
Claude Code guide: ${publicOrigin}/guides/claude-code
Evaluation methodology: ${publicOrigin}/methodology
Machine index: ${publicOrigin}/design-systems.json
`;
}

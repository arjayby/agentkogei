# AgentKogei Product Specification

Status: implemented

## Problem

AI coding agents can produce individually plausible interfaces that drift across a Project. They lack durable Project level direction for typography, color, layout, components, interaction states, responsiveness, motion, and accessibility. Builders then repeat preferences and repair inconsistencies.

Themes and component libraries primarily provide code or visual primitives. They do not provide one complete, agent readable system that every coding agent can discover and follow.

## Solution

AgentKogei provides a public Official Catalog, Design System Previews, Design Contract validation, and a CLI for installing versioned Design Systems.

Each Design System Release is one inert Markdown Design Contract named `DESIGN.md`. It directly targets React or Next.js Projects using Tailwind CSS v4 and shadcn/ui. The Official Catalog discovers complete, public, MIT licensed Design Systems from validated published release metadata.

The CLI retrieves a current or exact release, validates it, previews the change, and installs it after explicit consent. Installation writes one root `DESIGN.md` and one marked `AGENTS.md` reference. It preserves unrelated files, never executes supplied code, and leaves the Project unchanged on failure.

## Builder stories

1. As a Builder, I want to compare complete Published Design Systems so that I can choose a coherent direction for my Project.
2. As a Builder, I want to inspect each Design System Preview and its evaluation evidence so that I can assess direction, coverage, compatibility, and quality.
3. As a Builder, I want to retrieve every Design Contract publicly so that I can inspect the exact Markdown before Installation.
4. As a Builder, I want to install a current Design System Release by identity so that the common path is simple.
5. As a Builder, I want to install an exact release by identity and version so that Installation is reproducible.
6. As a Builder, I want the CLI to preview the selected release and file changes so that I can consent before mutation.
7. As a Builder, I want replacement to require explicit consent and force so that one Design System is never silently replaced.
8. As a Builder, I want failed Installation to leave my Project unchanged so that I can recover safely.
9. As a Builder, I want Installation to preserve existing Project files and agent instructions so that unrelated work survives.
10. As a Builder, I want a Design Contract to remain usable offline so that agent work has no service runtime dependency.
11. As a Builder, I want the CLI to transmit only my requested Design Contract selector so that Project identity and contents stay local.
12. As a maintainer, I want every release to pass the same validation and Design System Evaluation standard so that publication claims remain verifiable.
13. As a maintainer, I want Design Systems to use one canonical vocabulary across schemas, routes, CLI output, artifacts, tests, and documentation.
14. As a maintainer, I want the web application to remain stateless so that catalog delivery has no persistent application infrastructure.
15. As a contributor, I want all source code and Design System content under the MIT License so that the rights to use, modify, distribute, sublicense, and sell copies are clear.

## Implementation decisions

- The Official Catalog discovers Published Design Systems from validated release directories without an application registry of identities.
- The catalog is first party and version controlled.
- Each Design System Release contains one `DESIGN.md` plus its publication evaluation artifacts.
- Each installed Design Contract directly targets React or Next.js, Tailwind CSS v4, and shadcn/ui.
- There is no framework neutral core, manifest, supporting resource tree, or executable hook.
- Release metadata identifies the Design System, semantic release, compatibility, changelog, and evaluation evidence.
- Exact release routes are immutable. A bare identity resolves the current release.
- Current routes use public cache behavior appropriate to a moving selector. Exact routes use immutable public cache behavior.
- Design Contracts are public raw Markdown and require no authorization header.
- The CLI exposes only `add`. Removal is manual deletion of `DESIGN.md` and the marked `AGENTS.md` block.
- The CLI validates retrieval before mutation, previews changes, and waits for consent.
- `--yes` permits unattended Installation. Unattended replacement requires `--yes --force`.
- Installation writes only `DESIGN.md` and a marked `AGENTS.md` reference in the Project root.
- Installation preserves existing instructions and does not duplicate the marked reference.
- Any retrieval, validation, consent, conflict, or write failure leaves the Project unchanged.
- The CLI never runs scripts, installs dependencies, or invokes a package manager.
- A Project can have at most one Installed Design System.
- The installed file has no runtime dependency on AgentKogei.
- The web application serves only public catalog, documentation, preview, and Design Contract routes.
- The web application has no persistent application data or collection behavior.
- All repository source and Design System content use the MIT License. Installed Design Contracts contain only design direction.
- Publication requires original or rightfully used direction, automated validation, generation evidence, an originality review, and a WCAG 2.2 Level AA reference implementation.
- One Add Design System workflow creates a final release and opens its pull request. Merging to `main` admits the release to the Official Catalog and triggers Vercel production deployment.

## Acceptance boundary

The primary automated seam runs the built web application and packed CLI together against a controlled Official Catalog and temporary Projects.

Tests observe browser visible state, HTTP responses, CLI output and exit status, resulting Project files, and outbound CLI requests. They do not assert private functions, component state, or module composition.

The acceptance suite verifies:

- Every generated Published Design System and no retired identities
- Design System Previews, compatibility, evaluation evidence, and documentation
- Public current and exact Design Contract retrieval for every release
- Correct public cache behavior and response metadata
- Unknown responses for absent identities
- CLI Installation of current and exact releases through all supported package runners
- Preview, consent, one system enforcement, replacement, rollback, and preservation behavior
- One anonymous Design Contract request with no Project identity or contents
- Absence of removed product and infrastructure routes
- Theme behavior, responsive layouts, and WCAG 2.2 Level AA checks on public pages
- Publication validation for every committed Design System Release

Formatting, type checks, production builds, package construction, and the full black box suite support this acceptance boundary.

## Out of scope

- Third party catalogs, submissions, rankings, or reviews
- Teams, organizations, roles, or enterprise controls
- Project customization or hosted Project configuration
- Automatic interface redesign or migration
- More than one Installed Design System
- Managed status, automatic updates, or automatic release migration
- Supporting resource files, binary assets, or framework adapters
- Runtime SDKs or hosted token delivery
- Frameworks beyond React or Next.js with Tailwind CSS v4 and shadcn/ui
- Executable hooks, arbitrary scripts, or automatic dependency installation
- Repository inspection, prompt collection, generated interface collection, or dependency collection
- Native applications and design tool synchronization

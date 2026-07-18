# AgentKogei MVP Product Brief

Status: accepted on 2026-07-18

## Outcome

AgentKogei gives AI coding agents a durable interface system for a software Project. A Builder chooses one Design Pack, installs it locally, and gets consistent design direction across the Project's marketing, authentication and onboarding, and application surfaces.

The MVP validates two claims:

1. A sufficiently complete Design Contract materially reduces visual inconsistency and design rework in agent-built SaaS products.
2. Builders will pay annually for a continually maintained catalog of distinctive Premium Design Packs.

## Initial customer

The first customer is a solo technical founder or member of a small product team building a greenfield SaaS web application with AI coding agents.

The MVP is not designed for enterprise design-system teams, agencies managing catalogs for many clients, or third-party Design Pack sellers.

## Product model

- A **Design Pack** is a fixed, semantically versioned interface system.
- Its required entry point is a **Design Contract** named `DESIGN.md`.
- It may also contain tokens, assets, examples, component guidance, and a Stack Adapter.
- A Project can have at most one Installed Pack.
- There is no Project Profile or pack customizer. Manual pack edits explicitly Detach the pack from managed updates.
- Installation governs future agent work. It does not promise to redesign an existing interface.

## Interface boundary

Every Published Pack covers:

- Marketing pages, including landing and pricing surfaces
- Authentication and onboarding
- Authenticated product UI
- Semantic color, typography, spacing, radius, elevation, and motion
- Layout and responsive rules
- Component anatomy, variants, and interaction states
- Loading, empty, error, success, disabled, and destructive states
- Accessibility and reduced-motion behavior
- Agent-facing do and do-not examples
- A final validation checklist for agent work

Packs do not prescribe product workflows, information architecture, business logic, or product copy.

## Launch catalog

The Official Catalog launches with four first-party packs:

| Access | Working name | Direction |
| --- | --- | --- |
| Open | Foundation | Neutral, crisp, and highly legible B2B SaaS |
| Open | Editorial | Warm, spacious, and content-forward SaaS |
| Premium | Command | Dark-first, dense, technical interfaces for developer and operations products |
| Premium | Signal | Bold geometry, expressive color, richer motion, and graphic resources for AI and creative products |

Open and Premium packs meet the same completeness, accessibility, and evaluation standard. Premium value comes from greater creative distinctiveness, production depth, and supporting resources.

The Official Catalog is first-party only in the MVP. Third-party packs remain installable from compatible Pack Sources but are not submitted to or sold through the catalog.

## Publication standard

Every Pack Release must:

- Pass schema, file-safety, compatibility, and provenance validation
- Include original or compatibly licensed resources with attribution metadata
- Provide a React/Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter
- Produce representative marketing, authentication, dashboard, table, form, settings, and state screens
- Be evaluated across desktop and mobile, light and dark modes
- Demonstrate WCAG 2.2 Level AA in its reference implementation
- Pass repeated agent-generation tasks, automated checks, and human visual review
- Publish a visual Pack Preview and changelog

Patch releases clarify or correct without materially changing output. Minor releases add compatible guidance and resources. Major releases may intentionally alter a Project's interface and require migration notes.

## Web product

The web application provides:

- Public landing, catalog, pricing, and documentation pages
- Public Pack Previews for Open and Premium packs
- Raw Open Design Pack access without an account
- GitHub-only authentication for premium flows
- Polar checkout and billing portal access
- An account dashboard showing Premium Access and authorized CLI credentials
- Browser approval for CLI device authorization
- Public and authenticated shadcn-compatible registry endpoints

Premium previews expose rendered evidence, direction, coverage, compatibility, evaluation status, included resources, and changelog. They do not expose raw premium contracts, tokens, assets, or registry payloads.

## CLI product

The MIT-licensed AgentKogei CLI:

- Installs Open packs without an AgentKogei account
- Uses browser device authorization and a revocable Pack Credential for Premium packs
- Retrieves packs from public or authenticated shadcn-compatible Pack Sources
- Applies a local, exact-version snapshot and records file checksums
- Adds a managed `AGENTS.md` reference to the installed `DESIGN.md` without replacing existing instructions
- Detects an existing pack and refuses silent merging or replacement
- Previews all writes and conflicts before applying them
- Never executes pack-supplied code, scripts, dependency installation, or package-manager commands
- Detects local pack changes and requires explicit Detachment before managed updates
- Shows release diffs and requires explicit confirmation for updates, especially major releases

The CLI never sends repository names, Git remotes, file contents, prompts, generated UI, or dependency lists. Premium operations send only the Builder identity, Pack Release, action type, and a random Project License identifier. Diagnostics are opt-in.

## Access and licensing

- Web application, CLI, pack specification, and validators: MIT
- AgentKogei-authored Open Design Pack prose and original visual resources: CC BY 4.0
- Premium Design Packs: commercial Pack License
- Third-party Design Packs: publisher-selected Pack License declared in the pack manifest

Public visibility of a Premium Design Pack inside a genuine end-product Project does not convert it into an Open Design Pack. Extraction, resale, republishing, and reuse in another Project remain prohibited.

## Subscription

- Product: Premium Access to the complete premium catalog
- Price: USD $99 per year
- Account scope: one named Builder
- Project scope: unlimited Projects while Premium Access is active
- Team plan: deferred
- Trial: none; complete Open packs demonstrate the workflow
- Voluntary refunds: none; mandatory or Polar-issued refunds terminate affected access and licenses
- Content commitment: at least one Material Release per quarter

When Premium Access expires, the Builder cannot preview gated source, install, reinstall, or update any Premium Design Pack. A premium snapshot already installed while access was active remains licensed in that Project and usable by all Project collaborators. It continues to work offline without runtime checks or DRM.

## Billing and authentication

- Better Auth owns application sessions and GitHub OAuth.
- Better Auth device authorization supports the browser-approved CLI flow.
- Polar is the Merchant of Record and billing source of truth.
- AgentKogei owns Pack Credentials, Project License records, and registry authorization.
- Open catalog usage remains account-free.

## MVP exclusions

- Creator marketplace, submissions, payouts, and moderation
- Team organizations, invitations, roles, and seat billing
- Project Profile or live design customization
- Automatic redesign or migration of an existing application
- Frameworks other than React/Next.js with Tailwind CSS v4 and shadcn/ui
- Executable pack hooks
- Mandatory telemetry or customer repository inspection

## Validation gate

Before expanding the product, acquire 10 paid annual subscribers. Review real Projects with at least five of them and continue investing only if at least four demonstrate materially less visual inconsistency or design rework.

GitHub stars, site traffic, and Open Pack downloads are supporting signals rather than proof of the paid outcome.

## Required pre-launch review

The commercial Premium Design Pack License, subscription disclosures, public-Project permissions, third-party attribution, and no-voluntary-refund language require professional legal review before accepting production payments.

## Problem Statement

Builders using AI coding agents to create SaaS products repeatedly receive interfaces that are individually plausible but collectively inconsistent. The agents lack durable, project-level direction for typography, color, layout, components, interaction states, responsiveness, motion, and accessibility, so Builders spend time restating preferences and correcting design drift.

Existing themes and component libraries do not solve this problem because they primarily provide code or visual primitives rather than a complete, agent-readable Interface System. Builders need a safe way to select one coherent system, make it discoverable to every agent working in a Project, and keep it stable over time. They also need confidence that installing design guidance will not execute untrusted code, overwrite unrelated work, disclose Project contents, or stop working when a subscription ends.

AgentKogei also needs a sustainable open-source model. The application, CLI, format, validators, and complete Open Design Packs should be freely inspectable and extensible, while a maintained catalog of distinctive Premium Design Packs provides a reason to purchase annual Premium Access.

## Solution

AgentKogei will provide an open-source web application, Official Catalog, Design Contract specification, validator, and CLI for discovering and installing versioned Design Packs. Each Pack Release is delivered as a single `DESIGN.md` Design Contract: self-contained Markdown that carries token definitions, component guidance, examples, and human-readable provenance in one inert file directly targeting React and Next.js Projects using Tailwind CSS v4 and shadcn/ui.

The web application will present public Pack Previews, compatibility, evaluation evidence, pricing, documentation, GitHub authentication, Polar checkout and account management, Premium Access state, and browser approval for CLI authorization. Open Design Contracts remain available without an account. Premium Design Contracts are delivered only to an authorized CLI while Premium Access is active.

The CLI applies a Design Pack through one `add` command. It resolves an Official Catalog identity, retrieves and validates the raw Design Contract, previews the Pack Release, Pack License, and the files it will write, then—after explicit confirmation—writes one root `DESIGN.md` plus one marked `AGENTS.md` reference that preserves existing instructions. It never executes pack-supplied code and leaves the Project unchanged on any failure. A Project may contain only one Installed Pack; replacing it requires `--yes --force`.

Premium Access will cost USD $99 per year for one named Builder and cover every Premium Design Pack across unlimited Projects. Expiration ends catalog retrieval and new Installation, but an already Installed Pack remains usable offline in its licensed Project. This access model rests on the lasting Project License rather than runtime checks or DRM.

The Official Catalog will launch with two complete Open Design Packs—Foundation and Editorial—and two complete Premium Design Packs—Command and Signal. Every Published Pack must meet the same completeness, provenance, compatibility, accessibility, and Pack Evaluation standard.

## User Stories

1. As a prospective Builder, I want to understand the inconsistency AgentKogei solves, so that I can decide whether it is relevant to my agent-built product.
2. As a prospective Builder, I want to understand what a Design Pack contains, so that I do not mistake it for a theme or component template.
3. As a prospective Builder, I want to browse the Official Catalog without an account, so that discovery has no authentication barrier.
4. As a prospective Builder, I want to distinguish Open and Premium Design Packs, so that I understand which packs require Premium Access.
5. As a prospective Builder, I want to compare the Interface System directions of Published Packs, so that I can select an appropriate one for my Project.
6. As a prospective Builder, I want to view a Pack Preview for every Published Pack, so that I can evaluate its visual direction without exposing the gated Design Contract.
7. As a prospective Builder, I want to see the surfaces covered by a Published Pack, so that I know it supports marketing, authentication, onboarding, and product UI.
8. As a prospective Builder, I want to see stack compatibility for a Pack Release, so that I know whether it supports my Project.
9. As a prospective Builder, I want to see Pack Evaluation status and accessibility evidence, so that I can assess quality before Installation.
10. As a prospective Builder, I want to understand the depth of direction in a Pack Release, so that I can judge its value from the Pack Preview.
11. As a prospective Builder, I want to read a Pack Release changelog, so that I understand how the Interface System has evolved.
12. As a prospective Builder, I want to understand each Pack License before Installation, so that I know how the pack may be used and shared.
13. As a prospective Builder, I want clear annual pricing and subscription terms, so that I can make an informed purchase.
14. As a prospective Builder, I want the no-voluntary-refund policy disclosed before checkout, so that the commercial terms are not surprising.
15. As a Builder, I want to retrieve a complete Open Design Contract without an account, so that I can evaluate the real workflow before subscribing.
16. As a Builder, I want to authenticate with GitHub, so that I do not need a separate AgentKogei password.
17. As a Builder, I want to purchase Premium Access through Polar, so that billing and applicable taxes are handled through a trusted Merchant of Record.
18. As a subscribed Builder, I want one annual subscription to cover every Premium Design Pack, so that I do not need to purchase packs individually.
19. As a subscribed Builder, I want to use Premium Design Packs in unlimited Projects, so that the subscription does not constrain my work by Project count.
20. As a subscribed Builder, I want to see my Premium Access state, renewal information, and relevant billing status, so that I understand my current entitlement.
21. As a subscribed Builder, I want to open Polar's billing portal, so that I can manage my subscription and payment method.
22. As a Builder who cancels renewal, I want Premium Access to continue through the paid term, so that cancellation does not remove prepaid access early.
23. As a Builder whose Premium Access expires, I want public Pack Previews to remain visible, so that I can still assess the catalog before renewing.
24. As a Builder whose Premium Access expires, I want renewal to restore premium retrieval and Installation, so that I can resume adding Premium Design Contracts.
25. As a Builder, I want to initiate CLI authorization from my terminal, so that the CLI can retrieve Premium Design Packs without handling my GitHub password.
26. As a Builder, I want to approve or deny a CLI authorization request in my browser, so that terminal access requires an authenticated, intentional decision.
27. As a Builder, I want an expired or denied device authorization request to fail safely, so that stale codes cannot authorize a CLI.
28. As a Builder, I want to see my authorized Pack Credentials, so that I know which CLI installations can retrieve Premium Design Packs.
29. As a Builder, I want to revoke a Pack Credential, so that a lost or retired machine no longer has premium retrieval access.
30. As a Builder, I want Pack Credentials to grant no billing or account-management authority, so that CLI compromise has limited impact.
31. As a Builder, I want Pack Credentials kept outside my Project, so that committing a Project cannot expose my entitlement.
32. As a Builder, I want to install an Open Design Pack with `agentkogei add` by its Official Catalog identity, so that Installation is simple and account-free.
33. As a subscribed Builder, I want to install a Premium Design Pack with `agentkogei add` by its Official Catalog identity, so that entitlement is enforced without manual source handling.
34. As a subscribed Builder, I want `add` to start browser authorization automatically when the CLI holds no Pack Credential and then resume the same Installation, so that authorizing a premium install takes one command.
35. As a Builder, I want the CLI to show the Pack Release, Pack License, and the file it will write before Installation, so that I can make an informed decision.
36. As a Builder, I want Installation to require explicit confirmation, so that no Project changes happen merely from inspecting a pack.
37. As a Builder, I want a non-interactive Installation to require explicit `--yes` opt-in, so that automation cannot accidentally bypass consent.
38. As a Builder, I want an unresolved Design Pack identity or release to be refused as plain text without touching the Project, so that a typo cannot leave a partial write.
39. As a Builder, I want a malformed or non-successful catalog response to be refused before any write, so that a bad retrieval never changes my Project.
40. As a Builder, I want the Design Contract to be inert Markdown that the CLI never executes, so that adding a pack cannot run arbitrary code, install dependencies, or invoke a package manager.
41. As a Builder, I want the CLI to write only `DESIGN.md` and the marked `AGENTS.md` reference at my Project root, so that Installation cannot reach outside the Project.
42. As a Builder, I want existing unrelated files preserved, so that Installation cannot silently overwrite my work.
43. As a Builder, I want a refused or interrupted Installation to leave the Project exactly as it was, so that a failure starts from a known state.
44. As a Builder, I want a Project that already holds a Design Contract to refuse another pack unless I force it, so that two Interface Systems are never silently merged.
45. As a Builder, I want pack replacement to require `--yes --force`, so that changing Interface Systems cannot happen accidentally.
46. As a Builder, I want the exact Pack Release written locally, so that agent output does not change when the catalog changes.
47. As a Builder, I want the installed Design Contract to remain usable without AgentKogei or network access, so that normal Project work is not coupled to a service runtime.
48. As a Builder, I want the Design Contract installed with its required `DESIGN.md` name, so that AI coding agents can find consistent project-level direction.
49. As a Builder, I want a marked reference added to existing agent instructions without replacing them, so that the Design Contract is discoverable and my other instructions survive.
50. As a Builder, I want the marked agent-instruction block to be idempotent, so that repeated `add` runs do not duplicate instructions.
51. As a Builder, I want the installed Design Contract to carry its Pack Release identity and human-readable provenance inline, so that I can see what was installed by reading one file.
52. As a Builder, I want major Pack Releases called out with migration notes in the catalog and Pack Preview, so that intentionally changed output is not mistaken for a routine correction.
53. As a Builder, I want a failed `add` to preserve the existing Design Contract, so that a retrieval or validation failure does not break my Project.
54. As a subscribed Builder, I want premium Installation to establish a Project License without creating any Project identifier, so that premium rights are recorded without disclosing my Project.
55. As a collaborator, I want to use an Installed Premium Design Pack in its licensed Project, so that collaboration does not require every contributor to subscribe.
56. As a Builder, I want a genuine end-product Project containing an Installed Premium Design Pack to be public, so that open-source products remain possible without relicensing the pack.
57. As a Builder, I want Premium Access expiration to leave existing Installed Packs usable in their licensed Projects, so that subscription expiry does not break completed or ongoing work.
58. As a Builder whose Premium Access expired, I want new premium Installation and reinstallation denied, so that catalog access remains the subscription value.
59. As a Builder whose payment was refunded or reversed, I want the resulting rights state stated clearly, so that I understand that affected Project Licenses terminate even though local files are not remotely deleted.
60. As a Builder, I want Project Licenses to prohibit extraction, resale, republishing, and reuse in another Project, so that collaboration permission does not become redistribution permission.
61. As a privacy-conscious Builder, I want the CLI never to transmit Project names, paths, Git remotes, file contents, prompts, generated UI, or dependency lists, so that installing design guidance does not expose my work.
62. As a privacy-conscious Builder, I want premium operations to transmit only identity, Pack Release, and action type, so that entitlement works with minimal data and no Project identifier.
63. As a privacy-conscious Builder, I want diagnostics and crash reporting disabled by default, so that telemetry is always voluntary.
64. As a privacy-conscious Builder, I want to review exactly what opt-in diagnostics contain, so that consent is informed.
65. As a pack author, I want the Design Contract to declare its identity, release, license, and provenance inline, so that the validator can check a Pack Release from the one file it delivers.
66. As a pack author, I want setup and dependency guidance expressed as inert prose, so that Builders receive direction without granting code execution.
67. As an AgentKogei publisher, I want every Design Contract to declare original or compatible provenance and attribution, so that Published Packs can be distributed lawfully.
68. As an AgentKogei publisher, I want malformed, unsafe, or unprovenanced releases blocked from publication, so that the Official Catalog remains trustworthy.
69. As an AgentKogei publisher, I want every Pack Release to generate representative marketing, authentication, dashboard, table, form, settings, and state screens, so that Pack Evaluation covers real SaaS surfaces.
70. As an AgentKogei publisher, I want reference implementations evaluated on desktop and mobile and in light and dark modes, so that a Published Pack is not optimized for one presentation only.
71. As an AgentKogei publisher, I want reference implementations to demonstrate WCAG 2.2 Level AA and reduced-motion behavior, so that accessibility is part of publication quality.
72. As an AgentKogei publisher, I want repeated agent-generation tasks, automated checks, and human visual review, so that the Design Contract is evaluated as agent guidance rather than prose alone.
73. As an AgentKogei publisher, I want Pack Releases to be immutable and semantically versioned, so that an installed Design Contract remains reproducible.
74. As an AgentKogei publisher, I want to publish Pack Previews and changelogs without exposing the Premium Design Contract, so that prospective Builders receive evidence without bypassing Premium Access.
75. As a Builder, I want Open Design Packs to meet the same completeness and baseline quality as Premium Design Packs, so that the open experience is a real product rather than a teaser.
76. As a subscribed Builder, I want Premium Design Packs to offer greater distinctiveness, production depth, and breadth of direction, so that Premium Access has meaningful value without withholding basic quality.
77. As a Builder, I want Foundation to provide a neutral, crisp, highly legible B2B Interface System, so that I have a versatile Open starting point.
78. As a Builder, I want Editorial to provide a warm, spacious, content-forward Interface System, so that I have a distinct Open alternative.
79. As a subscribed Builder, I want Command to provide a dark-first, dense, technical Interface System, so that technical and operations products have a purpose-built premium direction.
80. As a subscribed Builder, I want Signal to provide bold geometry, expressive color, and richer motion direction, so that AI and creative products have a distinctive premium direction.
81. As a Builder, I want every Published Pack to address semantic tokens, layout, responsiveness, component anatomy, interaction states, loading, empty, error, success, disabled, and destructive states, so that agents receive complete interface direction.
82. As a Builder, I want every Design Contract to include agent-facing do and do-not examples and a final validation checklist, so that agents can evaluate their own work.
83. As a Builder, I want Design Packs to avoid prescribing workflows, information architecture, business logic, and product copy, so that the pack does not override product-specific decisions.
84. As an open-source contributor, I want the application, CLI, Design Contract specification, and validators under MIT, so that I can inspect, modify, integrate, and self-host the software.
85. As an open-source contributor, I want AgentKogei-authored Open Design Pack content under CC BY 4.0, so that it can be reused and adapted with attribution.
86. As a self-hosting Builder, I want it made clear that self-hosting the software does not grant Premium Design Packs, so that open software and commercial content remain separate.
87. As a subscribed Builder, I want AgentKogei to deliver at least one Material Release per quarter, so that annual Premium Access represents an actively maintained catalog.

## Implementation Decisions

- The MVP will extend the existing TypeScript monorepo and its Next.js web application, shared UI package, oRPC API layer, Better Auth integration, Drizzle data layer, Neon-compatible Postgres database, and Polar integration. New catalog, pack-validation, entitlement, and CLI responsibilities should be isolated behind domain-level interfaces rather than embedded in page components.
- The Official Catalog will be first-party and version-controlled at launch. Open Design Contracts may live in the public project. Premium Design Pack metadata and Pack Previews may be public, but the raw premium Design Contract must remain in private storage and out of public build artifacts.
- The launch catalog consists of Foundation and Editorial as Open Design Packs and Command and Signal as Premium Design Packs. All four are complete Published Packs, not feature-limited previews.
- Each Design Contract directly targets the React or Next.js, Tailwind CSS v4, and shadcn/ui stack. There is no framework-neutral core, Stack Adapter, or per-adapter packaging.
- The Design Contract declares its own identity, immutable semantic release, access class, Pack License, compatibility, human-readable provenance and attribution, and changelog or migration notes inline. There is no separate manifest or machine-readable metadata file.
- Every Pack Release is exactly one `DESIGN.md` Design Contract delivered as raw Markdown. There are no supporting resource files, declared targets, or content hashes.
- Pack Release semantics are fixed: patch releases clarify or correct without materially changing expected generated output; minor releases add compatible direction; major releases may intentionally change output and must include migration notes.
- Published Pack releases are immutable. A correction creates a new release at its own route instead of changing bytes under an existing version.
- The publication validator will reject invalid Design Contract structure, invalid semantic versions, missing required direction, unsafe or executable content, missing license data, and missing provenance or attribution.
- Pack Evaluation is a publication gate shared by Open and Premium Design Packs. It includes representative reference screens, repeated agent-generation tasks, automated structure and accessibility checks, desktop/mobile and light/dark coverage, reduced-motion coverage, and human visual review. The reference implementation must demonstrate WCAG 2.2 Level AA.
- The Official Catalog serves each Design Contract as raw Markdown at an immutable per-release route, plus a current-release route for a bare identity. The CLI owns entitlement checks, safe application, and one-pack enforcement.
- The Official Catalog exposes public metadata, Pack Previews, release history, compatibility, licenses, and evaluation summaries. Open Design Contracts are served publicly as raw Markdown. Premium Design Contracts require a valid Pack Credential and active Premium Access before returning any gated bytes.
- The CLI is MIT-licensed and distributed as an independently invocable command-line application. Its domain operations are `add`, browser authorization (`login`), and `logout`. Removal is the manual deletion of `DESIGN.md` and its marked `AGENTS.md` reference.
- The CLI performs complete retrieval and validation before mutating the Project. It then presents the release identity, license, and the file it will write. No writes occur until the Builder explicitly confirms or passes `--yes`.
- Installation must be failure-safe. Any fetch, validation, authorization, entitlement, confirmation, conflict, or write failure leaves the Project exactly as it was; no partial write is left behind.
- The CLI writes only `DESIGN.md` and the marked `AGENTS.md` reference at the Project root. It refuses unresolved catalog identities and non-successful responses as plain text, and never runs scripts or package-manager commands.
- The Design Contract is inert Markdown. The CLI never installs dependencies, runs migrations, executes pack code, or invokes a package manager; setup and dependency guidance is prose for the Builder to act on.
- A Project can have at most one Installed Pack. `add` refuses to overwrite an existing `DESIGN.md` unless the Builder passes `--yes --force`. Moving to another Design Pack is that same forced replacement.
- A successful `add` writes the exact Design Contract for the resolved Pack Release. The file carries its release identity and provenance inline and has no runtime dependency on AgentKogei; no separate record, snapshot directory, or checksum is created.
- `add` writes an idempotent marked block to `AGENTS.md` that points agents to the installed `DESIGN.md`. Existing instructions must be preserved, and repeated runs must not duplicate the block.
- Open `add` contacts only the Official Catalog and requires no AgentKogei identity. Premium `add` uses a Pack Credential and establishes a Project License without sending or creating a Project name, path, Git remote, or other Project identifier.
- Better Auth will provide GitHub-only web authentication. Existing email/password account creation and sign-in are removed from the product surface. Open catalog and Open Installation flows remain unauthenticated.
- Better Auth device authorization will provide the browser-approved CLI flow. A terminal receives a short-lived device request, the Builder authenticates with GitHub in the browser, and the Builder approves or denies the request. Expired, denied, replayed, or malformed requests fail without issuing a Pack Credential.
- AgentKogei owns Pack Credentials. Credentials are revocable, scoped only to premium pack retrieval operations, and provide no checkout, billing portal, profile-management, or general web-session authority. Credential secrets are not stored in Projects or returned again by the account dashboard.
- Polar remains Merchant of Record and billing source of truth. Checkout offers one USD $99 annual Premium Access product. Verified, idempotently processed Polar events drive entitlement state; the account dashboard links to Polar's customer portal rather than rebuilding billing management.
- Premium Access belongs to one named Builder, covers the complete Premium Design Pack catalog, permits unlimited Projects, has no trial, and has no voluntary refunds. Cancellation preserves access through the paid period. Mandatory, payment-reversal, or Polar-issued refunds terminate the affected Premium Access and Project Licenses.
- An active entitlement authorizes premium retrieval, new Installation, and reinstallation. Expiration denies those operations, including retrieval of releases previously installed. Public Pack Previews remain visible.
- A premium Installation made during active Premium Access creates a lasting Project License for that Design Contract snapshot. All collaborators may use it within that Project, including when the Project is a genuine public end product. It does not authorize extraction, resale, republishing, reuse in another Project, credential sharing, or continued catalog retrieval.
- Premium Access expiration does not alter or delete the installed Design Contract and does not add runtime checks or DRM. A refund or payment reversal terminates the legal rights associated with affected Project Licenses, but the service still does not remotely modify a Project.
- The database will extend the existing authentication model with the records required by device authorization, revocable Pack Credentials, Project License and Installation-event records, and idempotent billing-event or entitlement state. It must not store Project names, paths, remotes, contents, prompts, generated UI, dependency inventories, or any Project identifier.
- The web product will provide a public landing page, Official Catalog, Pack Preview and release detail views, pricing, documentation, GitHub sign-in, purchase return state, account dashboard, Pack Credential management, and browser device-approval flow.
- The account experience will distinguish active, canceling-at-period-end, expired, and refunded or reversed access where the billing source provides those states. Calls to action must reflect the actual entitlement: subscribe, manage billing, renew, authorize a CLI, or revoke a credential.
- Premium Pack Previews may show rendered evidence, direction, intended product categories, surface coverage, compatibility, evaluation status, and changelogs. They must not serialize or embed the gated Design Contract.
- The CLI sends no mandatory product analytics. It never transmits Project names, paths, Git remotes, file contents, prompts, generated UI, or dependency lists. Premium authorization sends only Builder identity, Pack Release, and action type. Diagnostics and crash reporting are separate, off by default, opt-in, and disclose their payload before consent.
- The web application, CLI, Design Contract specification, and validators will be released under MIT. AgentKogei-authored Open Design Pack prose and original visual resources will use CC BY 4.0 with required attribution. Premium Design Packs use a commercial Pack License.
- Every Design Contract's content must be original or compatibly licensed and record required source, license, and attribution inline. AI-assisted production requires human originality, accessibility, and rights review. Pack marketing may reference broad movements but must not claim to replicate a living designer, company, or recognizable commercial product.
- Premium storage and delivery must not expose the raw Design Contract through the open-source project, public deployment bundles, public caches, logs, Pack Previews, or unauthenticated error responses. Authorization failures reveal only non-sensitive catalog metadata.
- AgentKogei commits to at least one Material Release per quarter. A Material Release is a new Published Pack or a substantial compatible expansion with additional patterns, deeper direction, and Pack Evaluation coverage; compatibility fixes alone do not satisfy the commitment.
- Production payments must not be accepted until professional legal review covers the Premium Design Pack License, subscription disclosures, public-Project permissions, attribution obligations, and no-voluntary-refund wording.

## Testing Decisions

- The primary automated testing seam is the single black-box product boundary confirmed during specification. The built web/API product and built CLI run together against an isolated Postgres-compatible database, deterministic substitutes at the GitHub and Polar network boundaries, a controlled Official Catalog, and temporary Projects.
- Tests assert only observable behavior: browser-visible state, HTTP responses, CLI arguments and prompts, exit status and output, resulting Project files, and persisted effects visible through public product operations. Tests must not assert internal function calls, component state, private database queries, or implementation-specific module composition.
- The acceptance harness covers anonymous discovery, public Pack Previews, raw Open Design Contract retrieval, GitHub-only authentication behavior, checkout and webhook-driven entitlement transitions, account states, device approval and denial, Pack Credential issuance and revocation, and premium delivery authorization.
- The same seam executes the real packed CLI process against temporary Projects. It covers Open and Premium `add` for bare and exact releases, preview and confirmation behavior, `--yes` non-interactive consent, one-pack enforcement and `--yes --force` replacement, the single Design Contract written, the marked `AGENTS.md` reference and its preservation of existing instructions, refusal of every retired command and flag, and failure rollback.
- Failure fixtures exercise fetch failures, malformed or non-successful catalog responses, unresolved catalog identities, authorization denial and expiry, entitlement refusal, unconfirmed and unforced overwrite conflicts, and interrupted writes, and prove each leaves the Project unchanged. Credential fixtures cover expired credentials, revoked credentials, replayed device codes, and unauthenticated premium requests.
- Entitlement scenarios cover active access, cancellation at period end, expiration, renewal, mandatory or reversed refunds, Project License creation without a Project identifier, denied reinstallation after expiration, continued offline use of an existing Installed Pack, collaborator use, and the absence of runtime DRM.
- Privacy scenarios inspect outbound requests from the CLI and verify that Project names, paths, Git remotes, files, prompts, generated UI, and dependency lists are absent. Opt-in diagnostics are tested separately for default-off behavior and explicit payload disclosure.
- Pack publication uses valid and invalid Design Contract fixtures through the public validator or publication command surface rather than importing validator internals. It covers the required Design Contract, immutable semantic releases, licenses, provenance, compatibility, preview metadata, evaluation evidence, and the ban on executable behavior.
- Automated Pack Evaluation checks repeatable structure, representative screen coverage, responsive states, light/dark behavior, reduced motion, and machine-testable WCAG 2.2 Level AA criteria. Human visual review and rights review remain explicit publication gates because their judgments cannot be replaced by implementation tests.
- The launch catalog receives black-box smoke coverage proving that Foundation, Editorial, Command, and Signal expose correct metadata, previews, access classes, compatibility, licenses, and retrievability rules, and that Open packs are complete rather than restricted samples.
- Good tests use realistic release fixtures and state transitions, assert one domain outcome per scenario, remain deterministic without live GitHub or Polar accounts, and avoid snapshots of incidental markup or terminal formatting unless the exact output is itself a compatibility contract.
- The existing project has no behavioral test suite or comparable test fixture to reuse. Existing type-check, formatting, and production-build commands remain supporting verification, not substitutes for the new black-box acceptance seam.

## Out of Scope

- A creator marketplace, third-party catalog submissions, seller accounts, moderation, payouts, commissions, rankings, or reviews.
- Team organizations, invitations, roles, shared billing, seat management, or a team subscription plan.
- Per-pack purchases, monthly billing, trials, coupons, negotiated plans, or voluntary refunds.
- A Project Profile, pack customizer, token editor, live theme builder, or hosted per-Project configuration.
- Automatic redesign, migration, or reconciliation of an existing product interface.
- Silent pack merging, automatic updates, or automatic major-release migration.
- Managed Installed Pack status, modification detection, Detachment, checksum or integrity tracking, and pull-based update commands.
- More than one Installed Pack in a Project.
- Manifests, separate resource files, binary assets, Stack Adapters, and a framework-neutral pack core.
- Runtime SDKs, hosted token delivery, DRM, remote deletion, or a production dependency on AgentKogei after Installation.
- Frameworks other than React or Next.js with Tailwind CSS v4 and shadcn/ui in the MVP.
- Executable pack hooks, arbitrary scripts, automatic package installation, or package-manager execution.
- Mandatory analytics, repository inspection, prompt collection, generated-interface collection, or dependency telemetry.
- Third-party Pack Sources or distribution; the Official Catalog is first-party only.
- Enterprise controls, SSO, audit exports, compliance certifications, service-level agreements, or private support contracts.
- Pack-specific product workflows, information architecture, business logic, product copy, or a full application template.
- Native applications, mobile application stacks, design-tool plugins, or automatic synchronization with external design files.

## Further Notes

- The MVP's commercial validation gate is 10 paid annual subscribers. At least five should permit review of real Projects, and continued investment requires at least four of those five to demonstrate materially reduced visual inconsistency or design rework.
- GitHub stars, site traffic, Open Design Pack retrieval, and Pack Preview engagement are supporting signals, not proof of the paid outcome.
- The four launch packs and their Pack Evaluation evidence are part of the MVP deliverable, not post-launch content work.
- Premium value must come from creative distinctiveness, production depth, breadth of direction, and ongoing Material Releases. Baseline completeness, safety, and accessibility may not be reserved for Premium Design Packs.
- The current project already contains the core monorepo, web, authentication, API, data, UI, billing, and deployment foundations, but its screens and authentication flow are starter implementations. The implementation should preserve useful foundations while replacing starter product behavior with the domain model in this specification.
- The commercial Pack License and checkout disclosures require professional legal review. The implementation may prepare non-production flows, but production payment acceptance is blocked until that review is complete.

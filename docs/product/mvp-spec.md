## Problem Statement

Builders using AI coding agents to create SaaS products repeatedly receive interfaces that are individually plausible but collectively inconsistent. The agents lack durable, project-level direction for typography, color, layout, components, interaction states, responsiveness, motion, and accessibility, so Builders spend time restating preferences and correcting design drift.

Existing themes and component libraries do not solve this problem because they primarily provide code or visual primitives rather than a complete, agent-readable Interface System. Builders need a safe way to select one coherent system, make it discoverable to every agent working in a Project, and keep it stable over time. They also need confidence that installing design guidance will not execute untrusted code, overwrite unrelated work, disclose Project contents, or stop working when a subscription ends.

AgentKogei also needs a sustainable open-source model. The application, CLI, format, validators, and complete Open Design Packs should be freely inspectable and extensible, while a maintained catalog of distinctive Premium Design Packs provides a reason to purchase annual Premium Access.

## Solution

AgentKogei will provide an open-source web application, Official Catalog, pack specification, validator, and CLI for discovering and installing versioned Design Packs. Every Design Pack contains a required `DESIGN.md` Design Contract and may contain tokens, assets, examples, component guidance, and a Stack Adapter. The MVP supports React and Next.js Projects using Tailwind CSS v4 and shadcn/ui while keeping the pack model independent of any one stack.

The web application will present public Pack Previews, compatibility, evaluation evidence, pricing, documentation, GitHub authentication, Polar checkout and account management, Premium Access state, and browser approval for CLI authorization. Open Design Packs and their source resources remain available without an account. Premium source resources are delivered only to an authorized CLI while Premium Access is active.

The CLI will retrieve Open or Premium Design Packs from shadcn-compatible Pack Sources, validate them, preview all effects, and apply an exact local snapshot without executing pack-supplied code. It will preserve existing agent instructions while adding a managed reference to the Design Contract, record checksums, detect changes, require explicit updates, and prevent silent replacement or merging. A Project may contain only one Installed Pack.

Premium Access will cost USD $99 per year for one named Builder and cover every Premium Design Pack across unlimited Projects. Expiration ends catalog retrieval, installation, reinstallation, and updates, but an already Installed Pack remains usable offline in its licensed Project. This access model uses lasting Project Licenses rather than runtime checks or DRM.

The Official Catalog will launch with two complete Open Design Packs—Foundation and Editorial—and two complete Premium Design Packs—Command and Signal. Every Published Pack must meet the same completeness, provenance, compatibility, accessibility, and Pack Evaluation standard.

## User Stories

1. As a prospective Builder, I want to understand the inconsistency AgentKogei solves, so that I can decide whether it is relevant to my agent-built product.
2. As a prospective Builder, I want to understand what a Design Pack contains, so that I do not mistake it for a theme or component template.
3. As a prospective Builder, I want to browse the Official Catalog without an account, so that discovery has no authentication barrier.
4. As a prospective Builder, I want to distinguish Open and Premium Design Packs, so that I understand which resources require Premium Access.
5. As a prospective Builder, I want to compare the Interface System directions of Published Packs, so that I can select an appropriate one for my Project.
6. As a prospective Builder, I want to view a Pack Preview for every Published Pack, so that I can evaluate its visual direction without exposing gated source resources.
7. As a prospective Builder, I want to see the surfaces covered by a Published Pack, so that I know it supports marketing, authentication, onboarding, and product UI.
8. As a prospective Builder, I want to see stack compatibility for a Pack Release, so that I know whether it supports my Project.
9. As a prospective Builder, I want to see Pack Evaluation status and accessibility evidence, so that I can assess quality before Installation.
10. As a prospective Builder, I want to see the resources included in a Pack Release, so that I understand the value beyond its Design Contract.
11. As a prospective Builder, I want to read a Pack Release changelog, so that I understand how the Interface System has evolved.
12. As a prospective Builder, I want to understand each Pack License before Installation, so that I know how the pack may be used and shared.
13. As a prospective Builder, I want clear annual pricing and subscription terms, so that I can make an informed purchase.
14. As a prospective Builder, I want the no-voluntary-refund policy disclosed before checkout, so that the commercial terms are not surprising.
15. As a Builder, I want to retrieve a complete Open Design Pack without an account, so that I can evaluate the real workflow before subscribing.
16. As a Builder, I want to authenticate with GitHub, so that I do not need a separate AgentKogei password.
17. As a Builder, I want to purchase Premium Access through Polar, so that billing and applicable taxes are handled through a trusted Merchant of Record.
18. As a subscribed Builder, I want one annual subscription to cover every Premium Design Pack, so that I do not need to purchase packs individually.
19. As a subscribed Builder, I want to use Premium Design Packs in unlimited Projects, so that the subscription does not constrain my work by Project count.
20. As a subscribed Builder, I want to see my Premium Access state, renewal information, and relevant billing status, so that I understand my current entitlement.
21. As a subscribed Builder, I want to open Polar's billing portal, so that I can manage my subscription and payment method.
22. As a Builder who cancels renewal, I want Premium Access to continue through the paid term, so that cancellation does not remove prepaid access early.
23. As a Builder whose Premium Access expires, I want public Pack Previews to remain visible, so that I can still assess the catalog before renewing.
24. As a Builder whose Premium Access expires, I want renewal to restore premium retrieval and update access, so that I can resume managed use.
25. As a Builder, I want to initiate CLI authorization from my terminal, so that the CLI can retrieve Premium Design Packs without handling my GitHub password.
26. As a Builder, I want to approve or deny a CLI authorization request in my browser, so that terminal access requires an authenticated, intentional decision.
27. As a Builder, I want an expired or denied device authorization request to fail safely, so that stale codes cannot authorize a CLI.
28. As a Builder, I want to see my authorized Pack Credentials, so that I know which CLI installations can retrieve Premium Design Packs.
29. As a Builder, I want to revoke a Pack Credential, so that a lost or retired machine no longer has premium retrieval access.
30. As a Builder, I want Pack Credentials to grant no billing or account-management authority, so that CLI compromise has limited impact.
31. As a Builder, I want Pack Credentials kept outside my Project, so that committing a Project cannot expose my entitlement.
32. As a Builder, I want to install an Open Design Pack by its Official Catalog identity, so that Installation is simple and account-free.
33. As a subscribed Builder, I want to install a Premium Design Pack by its Official Catalog identity, so that entitlement is enforced without manual source handling.
34. As a Builder, I want to install a compatible third-party Design Pack from an explicit Pack Source, so that the open format is useful beyond the Official Catalog.
35. As a Builder, I want the CLI to show the Pack Release, Pack License, compatibility, target files, conflicts, and planned changes before Installation, so that I can make an informed decision.
36. As a Builder, I want Installation to require explicit confirmation, so that no Project changes happen merely from inspecting a pack.
37. As a Builder, I want a non-interactive Installation to require explicit opt-in, so that automation cannot accidentally bypass consent.
38. As a Builder, I want incompatible Stack Adapters to be rejected with a useful explanation, so that agents do not receive guidance for the wrong stack.
39. As a Builder, I want malformed or unsupported pack manifests to be rejected before writes, so that my Project is not partially changed.
40. As a Builder, I want file hashes to be verified before writes, so that corrupted or substituted pack resources are not installed.
41. As a Builder, I want absolute paths, traversal paths, duplicate targets, and symlink escapes rejected, so that a pack cannot write outside its allowed Project boundary.
42. As a Builder, I want executable hooks and scripts rejected, so that installing an untrusted pack cannot run arbitrary code.
43. As a Builder, I want dependency requirements shown as instructions rather than executed, so that I retain control of package changes.
44. As a Builder, I want existing unrelated files preserved, so that Installation cannot silently overwrite my work.
45. As a Builder, I want a conflicting Installation to leave the Project unchanged, so that resolving a conflict starts from a known state.
46. As a Builder, I want an interrupted Installation to avoid leaving a misleading Installed Pack record, so that status reflects what was actually applied.
47. As a Builder, I want a Project with an Installed Pack to reject another pack automatically, so that two Interface Systems are never silently merged.
48. As a Builder, I want pack replacement to require an intentional lifecycle action, so that changing Interface Systems cannot happen accidentally.
49. As a Builder, I want the exact Pack Release stored locally, so that agent output does not change when the catalog changes.
50. As a Builder, I want installed resources to remain available without AgentKogei or network access, so that normal Project work is not coupled to a service runtime.
51. As a Builder, I want the Design Contract installed with its required name, so that AI coding agents can find consistent project-level direction.
52. As a Builder, I want a managed reference added to existing agent instructions without replacing them, so that the Design Contract is discoverable and my other instructions survive.
53. As a Builder, I want the managed agent-instruction block to be idempotent, so that repeated lifecycle commands do not duplicate instructions.
54. As a Builder, I want Installation to record file checksums and Pack Release identity, so that later status and update decisions are trustworthy.
55. As a Builder, I want to inspect Installed Pack status, so that I can see its release, source, license state, and whether local files changed.
56. As a Builder, I want locally modified pack resources detected, so that managed updates cannot erase intentional changes.
57. As a Builder, I want to Detach an intentionally modified Installed Pack, so that I can keep using it while acknowledging that updates are no longer managed.
58. As a Builder, I want a Detached Pack to refuse managed updates, so that local design decisions are not silently reconciled.
59. As a Builder, I want to see available Pack Releases and their changes, so that I can decide whether an update is worthwhile.
60. As a Builder, I want an update preview to show resource differences and conflicts before writing, so that I can assess its effect on the Project.
61. As a Builder, I want updates to require explicit confirmation, so that an Installed Pack never changes silently.
62. As a Builder, I want major Pack Releases called out with migration notes, so that intentionally changed output is not mistaken for a routine correction.
63. As a Builder, I want a failed update to preserve the existing usable snapshot, so that release retrieval or validation failures do not break my Project.
64. As a subscribed Builder, I want Installation to establish a Project License using an opaque identifier, so that premium rights are recorded without disclosing my Project identity.
65. As a collaborator, I want to use an Installed Premium Design Pack in its licensed Project, so that collaboration does not require every contributor to subscribe.
66. As a Builder, I want a genuine end-product Project containing an Installed Premium Design Pack to be public, so that open-source products remain possible without relicensing the pack.
67. As a Builder, I want Premium Access expiration to leave existing Installed Packs usable in their licensed Projects, so that subscription expiry does not break completed or ongoing work.
68. As a Builder whose Premium Access expired, I want new premium Installation, reinstallation, and updates denied, so that catalog access remains the subscription value.
69. As a Builder whose payment was refunded or reversed, I want the resulting rights state stated clearly, so that I understand that affected Project Licenses terminate even though local files are not remotely deleted.
70. As a Builder, I want Project Licenses to prohibit extraction, resale, republishing, and reuse in another Project, so that collaboration permission does not become redistribution permission.
71. As a privacy-conscious Builder, I want the CLI never to transmit Project names, Git remotes, file contents, prompts, generated UI, or dependency lists, so that installing design guidance does not expose my work.
72. As a privacy-conscious Builder, I want premium operations to transmit only identity, Pack Release, action type, and an opaque Project License identifier, so that entitlement can work with minimal data.
73. As a privacy-conscious Builder, I want diagnostics and crash reporting disabled by default, so that telemetry is always voluntary.
74. As a privacy-conscious Builder, I want to review exactly what opt-in diagnostics contain, so that consent is informed.
75. As a pack author, I want a framework-neutral Interface System with a distinct Stack Adapter, so that future frameworks can be supported without redefining the pack.
76. As a pack author, I want a versioned manifest describing identity, files, compatibility, licensing, provenance, evaluation, and release information, so that tools can validate the pack consistently.
77. As a pack author, I want to declare setup instructions and dependencies without executable hooks, so that Builders receive guidance without granting code execution.
78. As a pack author, I want compatible shadcn registry transport, so that packs can use an existing distribution envelope rather than a proprietary protocol.
79. As a third-party pack author, I want to select and declare my own Pack License, so that AgentKogei does not claim rights over my work.
80. As an AgentKogei publisher, I want every resource to declare original or compatible provenance and attribution, so that Published Packs can be distributed lawfully.
81. As an AgentKogei publisher, I want malformed, unsafe, incompatible, or unprovenanced releases blocked from publication, so that the Official Catalog remains trustworthy.
82. As an AgentKogei publisher, I want every Pack Release to generate representative marketing, authentication, dashboard, table, form, settings, and state screens, so that Pack Evaluation covers real SaaS surfaces.
83. As an AgentKogei publisher, I want reference implementations evaluated on desktop and mobile and in light and dark modes, so that a Published Pack is not optimized for one presentation only.
84. As an AgentKogei publisher, I want reference implementations to demonstrate WCAG 2.2 Level AA and reduced-motion behavior, so that accessibility is part of publication quality.
85. As an AgentKogei publisher, I want repeated agent-generation tasks, automated checks, and human visual review, so that the Design Contract is evaluated as agent guidance rather than prose alone.
86. As an AgentKogei publisher, I want Pack Releases to be immutable and semantically versioned, so that Installed Pack records remain reproducible.
87. As an AgentKogei publisher, I want to publish Pack Previews and changelogs without exposing Premium Design Pack resources, so that prospective Builders receive evidence without bypassing Premium Access.
88. As a Builder, I want Open Design Packs to meet the same completeness and baseline quality as Premium Design Packs, so that the open experience is a real product rather than a teaser.
89. As a subscribed Builder, I want Premium Design Packs to offer greater distinctiveness, production depth, and supporting resources, so that Premium Access has meaningful value without withholding basic quality.
90. As a Builder, I want Foundation to provide a neutral, crisp, highly legible B2B Interface System, so that I have a versatile Open starting point.
91. As a Builder, I want Editorial to provide a warm, spacious, content-forward Interface System, so that I have a distinct Open alternative.
92. As a subscribed Builder, I want Command to provide a dark-first, dense, technical Interface System, so that technical and operations products have a purpose-built premium direction.
93. As a subscribed Builder, I want Signal to provide bold geometry, expressive color, richer motion, and graphic resources, so that AI and creative products have a distinctive premium direction.
94. As a Builder, I want every Published Pack to address semantic tokens, layout, responsiveness, component anatomy, interaction states, loading, empty, error, success, disabled, and destructive states, so that agents receive complete interface direction.
95. As a Builder, I want every Design Contract to include agent-facing do and do-not examples and a final validation checklist, so that agents can evaluate their own work.
96. As a Builder, I want Design Packs to avoid prescribing workflows, information architecture, business logic, and product copy, so that the pack does not override product-specific decisions.
97. As an open-source contributor, I want the application, CLI, pack specification, and validators under MIT, so that I can inspect, modify, integrate, and self-host the software.
98. As an open-source contributor, I want AgentKogei-authored Open Design Pack content under CC BY 4.0, so that it can be reused and adapted with attribution.
99. As a self-hosting Builder, I want it made clear that self-hosting the software does not grant Premium Design Pack resources, so that open software and commercial content remain separate.
100. As a subscribed Builder, I want AgentKogei to deliver at least one Material Release per quarter, so that annual Premium Access represents an actively maintained catalog.

## Implementation Decisions

- The MVP will extend the existing TypeScript monorepo and its Next.js web application, shared UI package, oRPC API layer, Better Auth integration, Drizzle data layer, Neon-compatible Postgres database, and Polar integration. New catalog, pack-validation, entitlement, and CLI responsibilities should be isolated behind domain-level interfaces rather than embedded in page components.
- The Official Catalog will be first-party and version-controlled at launch. Open Design Pack contents may live in the public project. Premium Design Pack metadata and Pack Previews may be public, but raw premium contracts, tokens, assets, and registry payloads must remain in private storage and out of public build artifacts.
- The launch catalog consists of Foundation and Editorial as Open Design Packs and Command and Signal as Premium Design Packs. All four are complete Published Packs, not feature-limited previews.
- A Design Pack is framework-neutral at its core and contains one or more Stack Adapters. The MVP publishes and validates only the React or Next.js, Tailwind CSS v4, and shadcn/ui adapter. The manifest and validator must allow additional adapters in future versions without redefining the core Interface System.
- Every pack manifest will identify the schema version, pack identity, immutable semantic release, access class, Pack License, Design Contract entry point, supported Stack Adapters, compatibility constraints, declared files and hashes, non-executable dependency/setup guidance, provenance and attribution, evaluation evidence, preview metadata, and changelog or migration information.
- Every Pack Release must contain a `DESIGN.md` Design Contract. Supporting resources may include design tokens, assets, examples, component guidance, and Stack Adapter material. Manifest-declared targets must be deterministic and relative to the Project.
- Pack Release semantics are fixed: patch releases clarify or correct without materially changing expected generated output; minor releases add compatible guidance or resources; major releases may intentionally change output and must include migration notes.
- Published Pack releases are immutable. A correction creates a new release instead of changing bytes under an existing version. All declared resources are content-hashed.
- The publication validator will reject unsupported schemas, invalid semantic versions, missing required resources, hash mismatches, duplicate or unsafe targets, executable hooks, prohibited file modes, incompatible Stack Adapter metadata, missing license data, and missing provenance or attribution.
- Pack Evaluation is a publication gate shared by Open and Premium Design Packs. It includes representative reference screens, repeated agent-generation tasks, automated structure and accessibility checks, desktop/mobile and light/dark coverage, reduced-motion coverage, and human visual review. The reference implementation must demonstrate WCAG 2.2 Level AA.
- The shadcn registry format is the transport envelope, while the AgentKogei manifest remains the source of pack-specific semantics. The CLI may use registry data retrieval and validation capabilities but must own entitlement checks, safe application, Installed Pack state, and lifecycle rules.
- The Official Catalog exposes public metadata, Pack Previews, release history, compatibility, licenses, and evaluation summaries. Open Pack Sources expose complete registry payloads without authentication. Premium Pack Sources require a valid Pack Credential and active Premium Access before returning any gated resource.
- A compatible third-party Pack Source may be supplied explicitly to the CLI. Third-party sources are not listed, submitted, reviewed, sold, paid out, or moderated by the Official Catalog in the MVP. The third-party publisher's declared Pack License governs its content.
- The CLI is MIT-licensed and distributed as an independently invocable command-line application. Its domain operations include authentication, credential revocation or logout, Installation, status inspection, update inspection and application, and explicit Detachment.
- The CLI will perform complete retrieval and validation before mutating the Project. It will then present the release identity, license, compatibility, intended writes, instructions, and conflicts. No writes occur until the Builder explicitly confirms or uses an explicit non-interactive consent mechanism.
- Installation must be failure-safe. Validation or conflict failures leave Project resources and Installed Pack state unchanged. An interruption must not create a valid Installed Pack record unless the declared snapshot was applied successfully.
- The CLI must reject absolute targets, parent traversal, targets that escape through symlinks, duplicate destinations, undeclared resources, hash mismatches, unsupported schema versions, executable install hooks, and any request to run scripts or package-manager commands.
- Dependency and setup requirements are declarative output for the Builder. The CLI never installs dependencies, runs migrations, executes pack scripts, or invokes a package manager.
- A Project can have at most one Installed Pack. Installation detects existing managed state and refuses silent merging, overwriting, or replacement. Moving to another Design Pack requires an intentional lifecycle decision that preserves or explicitly resolves the previous pack's files.
- A successful Installation creates an exact local snapshot and an Installed Pack record containing pack and release identity, Pack Source, license metadata, declared targets, and checksums. The Installed Pack has no runtime dependency on AgentKogei.
- Installation adds an idempotent managed block to `AGENTS.md` that points agents to the installed `DESIGN.md`. Existing instructions must be preserved. Removal or lifecycle changes may edit only the managed block unless the Builder explicitly resolves a conflict.
- Status compares recorded hashes with current resources. Unchanged snapshots remain managed. Intentional local modification requires explicit Detachment before further managed updates. A Detached Pack remains usable but managed updates are blocked until changes are reconciled through an explicit future action.
- Updates are pull-based and never silent. The CLI retrieves release metadata, shows the changelog, semantic release level, migration notes, resource diffs, and conflicts, then requires confirmation. A failed update leaves the previous Installed Pack usable and recorded.
- Open Installation contacts only the chosen Pack Source and requires no AgentKogei identity. Premium Installation and update use a Pack Credential and create or reference an opaque random Project License identifier without sending a Project name, path, Git remote, or other Project identity.
- Better Auth will provide GitHub-only web authentication. Existing email/password account creation and sign-in are removed from the product surface. Open catalog and Open Installation flows remain unauthenticated.
- Better Auth device authorization will provide the browser-approved CLI flow. A terminal receives a short-lived device request, the Builder authenticates with GitHub in the browser, and the Builder approves or denies the request. Expired, denied, replayed, or malformed requests fail without issuing a Pack Credential.
- AgentKogei owns Pack Credentials. Credentials are revocable, scoped only to premium pack retrieval operations, and provide no checkout, billing portal, profile-management, or general web-session authority. Credential secrets are not stored in Projects or returned again by the account dashboard.
- Polar remains Merchant of Record and billing source of truth. Checkout offers one USD $99 annual Premium Access product. Verified, idempotently processed Polar events drive entitlement state; the account dashboard links to Polar's customer portal rather than rebuilding billing management.
- Premium Access belongs to one named Builder, covers the complete Premium Design Pack catalog, permits unlimited Projects, has no trial, and has no voluntary refunds. Cancellation preserves access through the paid period. Mandatory, payment-reversal, or Polar-issued refunds terminate the affected Premium Access and Project Licenses.
- An active entitlement authorizes premium source retrieval, new Installation, reinstallation, and updates. Expiration denies those operations, including retrieval of releases previously installed. Public Pack Previews remain visible.
- A premium Installation made during active Premium Access creates a lasting Project License for that exact Project snapshot. All collaborators may use it within that Project, including when the Project is a genuine public end product. It does not authorize extraction, resale, republishing, reuse in another Project, credential sharing, or continued catalog retrieval.
- Premium Access expiration does not alter or delete local resources and does not add runtime checks or DRM. A refund or payment reversal terminates the legal rights associated with affected Project Licenses, but the service still does not remotely modify a Project.
- The database will extend the existing authentication model with the records required by device authorization, revocable Pack Credentials, opaque Project Licenses, and idempotent billing-event or entitlement state. It must not store Project names, paths, remotes, contents, prompts, generated UI, or dependency inventories.
- The web product will provide a public landing page, Official Catalog, Pack Preview and release detail views, pricing, documentation, GitHub sign-in, purchase return state, account dashboard, Pack Credential management, and browser device-approval flow.
- The account experience will distinguish active, canceling-at-period-end, expired, and refunded or reversed access where the billing source provides those states. Calls to action must reflect the actual entitlement: subscribe, manage billing, renew, authorize a CLI, or revoke a credential.
- Premium Pack Previews may show rendered evidence, direction, intended product categories, surface coverage, compatibility, evaluation status, included-resource descriptions, and changelogs. They must not serialize or embed gated Design Contracts, tokens, assets, source maps, or registry payloads.
- The CLI sends no mandatory product analytics. It never transmits Project names, paths, Git remotes, file contents, prompts, generated UI, or dependency lists. Premium authorization sends only Builder identity, Pack Release, action type, and opaque Project License identity. Diagnostics and crash reporting are separate, off by default, opt-in, and disclose their payload before consent.
- The web application, CLI, Design Pack specification, and validators will be released under MIT. AgentKogei-authored Open Design Pack prose and original visual resources will use CC BY 4.0 with required attribution. Premium Design Packs use a commercial Pack License. Every third-party pack declares its publisher-selected license.
- Every bundled resource must be original or compatibly licensed and include required source, license, and attribution metadata. AI-assisted production requires human originality, accessibility, and rights review. Pack marketing may reference broad movements but must not claim to replicate a living designer, company, or recognizable commercial product.
- Premium source storage and delivery must not expose raw resources through the open-source project, public deployment bundles, public caches, logs, Pack Previews, or unauthenticated error responses. Authorization failures reveal only non-sensitive catalog metadata.
- AgentKogei commits to at least one Material Release per quarter. A Material Release is a new Published Pack or a substantial compatible expansion with additional patterns, resources, and Pack Evaluation coverage; compatibility fixes alone do not satisfy the commitment.
- Production payments must not be accepted until professional legal review covers the Premium Design Pack License, subscription disclosures, public-Project permissions, attribution obligations, and no-voluntary-refund wording.

## Testing Decisions

- The primary automated testing seam is the single black-box product boundary confirmed during specification. The built web/API product and built CLI run together against an isolated Postgres-compatible database, deterministic substitutes at the GitHub and Polar network boundaries, controlled Open and Premium Pack Sources, and temporary Projects.
- Tests assert only observable behavior: browser-visible state, HTTP responses, CLI arguments and prompts, exit status and output, resulting Project files, and persisted effects visible through public product operations. Tests must not assert internal function calls, component state, private database queries, or implementation-specific module composition.
- The acceptance harness covers anonymous discovery, public Pack Previews, raw Open Design Pack retrieval, GitHub-only authentication behavior, checkout and webhook-driven entitlement transitions, account states, device approval and denial, Pack Credential issuance and revocation, and premium registry authorization.
- The same seam executes the real CLI process against temporary Projects. It covers Open and Premium Installation, third-party Pack Sources, plan and confirmation behavior, one-pack enforcement, exact snapshots, managed agent instructions, status, modification detection, Detachment, release diffs, explicit updates, major-release warnings, and failure rollback.
- Security fixtures exercise malformed manifests, unsupported schemas, absolute and traversal targets, symlink escapes, duplicate targets, undeclared files, hash mismatches, executable hooks, dependency-install requests, overwrite conflicts, interrupted retrieval, expired credentials, revoked credentials, replayed device codes, and unauthenticated premium requests.
- Entitlement scenarios cover active access, cancellation at period end, expiration, renewal, mandatory or reversed refunds, Project License creation, denied reinstallation and updates after expiration, continued offline use of an existing Installed Pack, collaborator use, and the absence of runtime DRM.
- Privacy scenarios inspect outbound requests from the CLI and verify that Project names, paths, Git remotes, files, prompts, generated UI, and dependency lists are absent. Opt-in diagnostics are tested separately for default-off behavior and explicit payload disclosure.
- Pack publication uses valid and invalid release fixtures through the public validator or publication command surface rather than importing validator internals. It covers required Design Contracts, manifests, immutable semantic releases, hashes, licenses, provenance, compatibility, preview metadata, evaluation evidence, and the ban on executable behavior.
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
- More than one Installed Pack in a Project.
- Runtime SDKs, hosted token delivery, DRM, remote deletion, or a production dependency on AgentKogei after Installation.
- Stack Adapters outside React or Next.js with Tailwind CSS v4 and shadcn/ui in the MVP.
- Executable pack hooks, arbitrary scripts, automatic package installation, or package-manager execution.
- Mandatory analytics, repository inspection, prompt collection, generated-interface collection, or dependency telemetry.
- Third-party Pack Evaluation or an AgentKogei guarantee for packs installed from outside the Official Catalog.
- Enterprise controls, SSO, audit exports, compliance certifications, service-level agreements, or private support contracts.
- Pack-specific product workflows, information architecture, business logic, product copy, or a full application template.
- Native applications, mobile application stacks, design-tool plugins, or automatic synchronization with external design files.

## Further Notes

- The MVP's commercial validation gate is 10 paid annual subscribers. At least five should permit review of real Projects, and continued investment requires at least four of those five to demonstrate materially reduced visual inconsistency or design rework.
- GitHub stars, site traffic, Open Design Pack retrieval, and Pack Preview engagement are supporting signals, not proof of the paid outcome.
- The four launch packs and their Pack Evaluation evidence are part of the MVP deliverable, not post-launch content work.
- Premium value must come from creative distinctiveness, production depth, richer supporting resources, and ongoing Material Releases. Baseline completeness, safety, and accessibility may not be reserved for Premium Design Packs.
- The current project already contains the core monorepo, web, authentication, API, data, UI, billing, and deployment foundations, but its screens and authentication flow are starter implementations. The implementation should preserve useful foundations while replacing starter product behavior with the domain model in this specification.
- The commercial Pack License and checkout disclosures require professional legal review. The implementation may prepare non-production flows, but production payment acceptance is blocked until that review is complete.

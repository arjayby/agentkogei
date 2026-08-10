# AgentKogei

AgentKogei helps software makers give AI agents durable design direction so the interfaces they produce remain coherent across a project.

## Language

**Builder**:
A solo technical founder or member of a small product team who uses AI coding agents to build a SaaS web application.
_Avoid_: user, developer, customer

**Project**:
The software repository in which a Builder and their AI coding agents create a product.
_Avoid_: repo, codebase, workspace

**Design System**:
A versioned, self-contained body of agent-readable visual and behavioral direction for a product. Each Design System Release is delivered to a Project as a single Design Contract.
_Avoid_: legacy catalog names, `DESIGN.md`, template, theme

**Design Contract**:
The root `DESIGN.md` document through which an Installed Design System directs a Project's AI coding agents. It contains the complete Design System Release as a single, inspectable artifact.
_Avoid_: prompt, style guide, rules file

**Official Catalog**:
The curated collection of MIT-licensed Design Systems published and maintained by AgentKogei. It contains only first-party systems and is presented to Builders as Design Systems.
_Avoid_: marketplace, store, registry, Catalog as a public collection name

**Published Design System**:
A Design System admitted to the Official Catalog after meeting its completeness and quality requirements.
_Avoid_: listing, catalog item

**Design System Evaluation**:
The standardized generation, automated validation, and human review process that a Design System Release must pass before its Design System can be published, including evidence that its reference implementation meets WCAG 2.2 Level AA.
_Avoid_: demo, preview, test

**Design System Preview**:
The public visual and descriptive specimen showing a Design System's direction, tokens, typography, components, behavior, coverage, compatibility, and evaluation status. It presents the system consistently without replacing its complete Design Contract.
_Avoid_: demo, sample, source, showcase, style guide

**Design System Mark**:
An original abstract symbol that identifies one Design System within a cohesive AgentKogei family. It remains recognizable at navigation size and when enlarged within its Design System Preview.
_Avoid_: icon, logo, preview artwork, borrowed brand symbol

**Design System Release**:
An immutable edition of a Design System identified by a two part `major.minor` version. Minor releases add compatible direction, while major releases may intentionally change a Project's interface.
_Avoid_: three part semantic version, patch release, latest, update, revision

**Candidate Design System Release**:
A complete proposed Design System Release that is ready for validation and Design System Evaluation but has not yet been admitted to the Official Catalog.
_Avoid_: draft `DESIGN.md`, generated file, unfinished release

**Authoring Approval**:
A maintainer's explicit acceptance that a validated Candidate Design System Release expresses its approved creative brief and is ready for Design System Evaluation. It does not assert that evaluation has passed or authorize publication.
_Avoid_: publication approval, evaluation pass, looks good

**Publication Approval**:
A maintainer's explicit authorization to admit an evaluated Design System Release to the Official Catalog and deploy it to production. It is granted only after all automated evaluation and separate visual, accessibility, and rights reviews have passed.
_Avoid_: authoring approval, candidate approval, merge approval

**Design Reference**:
An image or URL supplied as inspiration for a Candidate Design System Release. It may inform general visual characteristics but is never a target for copying product identity, proprietary assets, distinctive compositions, or a living designer's style.
_Avoid_: source design, replication target, style clone

**Installation**:
The declarative, non-executable application of a Design System to a Project through the AgentKogei CLI. It places the Design Contract at the Project root and makes it discoverable through the Project's agent instructions, but does not migrate an existing interface.
_Avoid_: download, copy

**Installed Design System**:
A Design System applied to a Project as its root Design Contract and agent-instruction reference. It remains usable without AgentKogei or network access; a Project can have at most one Installed Design System at a time.
_Avoid_: hosted system, linked system

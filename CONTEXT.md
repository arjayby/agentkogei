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
_Avoid_: design pack, interface system, design.md, template, theme

**Design Contract**:
The root `DESIGN.md` document through which an Installed Design System directs a Project's AI coding agents. It contains the complete Design System Release as a single, inspectable artifact.
_Avoid_: prompt, style guide, rules file

**Official Catalog**:
The curated collection of MIT-licensed Design Systems published and maintained by AgentKogei. It contains only first-party systems.
_Avoid_: marketplace, store, registry

**Published Design System**:
A Design System admitted to the Official Catalog after meeting its completeness and quality requirements.
_Avoid_: listing, pack

**Design System Evaluation**:
The standardized generation, automated validation, and human review process that a Design System Release must pass before its Design System can be published, including evidence that its reference implementation meets WCAG 2.2 Level AA.
_Avoid_: demo, preview, test

**Design System Preview**:
The public visual and descriptive evidence showing a Design System's direction, coverage, compatibility, and evaluation status.
_Avoid_: demo, sample, source

**Design System Release**:
An immutable, semantically versioned edition of a Design System. Patch releases preserve generated output, minor releases add compatible direction, and major releases may intentionally change a Project's interface.
_Avoid_: latest, update, revision

**Installation**:
The declarative, non-executable application of a Design System to a Project through the AgentKogei CLI. It places the Design Contract at the Project root and makes it discoverable through the Project's agent instructions, but does not migrate an existing interface.
_Avoid_: download, copy

**Installed Design System**:
A Design System applied to a Project as its root Design Contract and agent-instruction reference. It remains usable without AgentKogei or network access; a Project can have at most one Installed Design System at a time.
_Avoid_: installed pack, hosted system, linked system

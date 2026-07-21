# AgentKogei

AgentKogei helps software makers give AI agents durable design direction so the interfaces they produce remain coherent across a project.

## Language

**Builder**:
A solo technical founder or member of a small product team who uses AI coding agents to build a SaaS web application.
_Avoid_: user, developer, customer

**Project**:
The software repository in which a Builder and their AI coding agents create a product.
_Avoid_: repo, codebase, workspace

**Design Pack**:
A versioned, self-contained body of agent-readable design direction that defines an Interface System. Each Design Pack is delivered to a Project as a single Design Contract.
_Avoid_: design.md, template, theme

**Design Contract**:
The root `DESIGN.md` document through which an Installed Pack tells a Project's AI coding agents which Interface System to follow. It contains the complete Pack Release as a single, inspectable artifact.
_Avoid_: prompt, style guide, rules file

**Open Design Pack**:
A complete Design Pack that anyone may discover and install without an AgentKogei account and whose contents may be freely used, modified, and shared under its open license.
_Avoid_: free pack, public pack

**Premium Design Pack**:
A commercially licensed Design Pack available only to Builders with Premium Access. Its paid value comes from greater creative distinctiveness, production depth, and breadth of direction rather than withholding baseline quality.
_Avoid_: paid pack, private pack

**Premium Access**:
The annual subscription entitlement that allows one named Builder to retrieve every Premium Design Pack and its Pack Releases from the Official Catalog for unlimited Projects while the subscription is active. Open Design Packs never require Premium Access.
_Avoid_: all access, purchase, ownership

**Project License**:
The lasting right for all collaborators to use a specific Premium Design Pack snapshot within the Project where it was installed while Premium Access was active, unless the underlying payment is refunded or reversed. It arises from Installation rather than a per-Project identifier. The Project may be public without converting the pack into an Open Design Pack; the license does not include catalog access, later Pack Releases, extraction for another Project, or reuse of the subscriber's credentials.
_Avoid_: ownership, permanent access, download license

**Official Catalog**:
The curated collection of Open and Premium Design Packs published and maintained by AgentKogei. It contains only first-party packs.
_Avoid_: marketplace, store, registry

**Published Pack**:
A Design Pack admitted to the Official Catalog after meeting its completeness and quality requirements. Open and Premium Design Packs must meet the same publication standard.
_Avoid_: listing, teaser pack

**Pack Evaluation**:
The standardized generation, automated validation, and human review process that a Design Pack release must pass before it can become a Published Pack, including evidence that its reference implementation meets WCAG 2.2 Level AA.
_Avoid_: demo, preview, test

**Pack Preview**:
The public visual and descriptive evidence showing a Design Pack's Interface System, coverage, compatibility, and evaluation status without exposing its gated Design Contract.
_Avoid_: demo, sample pack, source

**Material Release**:
A new Published Pack or a substantial expansion of an existing pack with additional patterns, deeper direction, and Pack Evaluation coverage. Compatibility fixes and minor refinements are not Material Releases.
_Avoid_: update, patch, content drop

**Pack Release**:
An immutable, semantically versioned edition of a Design Pack. Patch releases preserve generated output, minor releases add compatible direction, and major releases may intentionally change a Project's interface.
_Avoid_: latest, update, revision

**Installation**:
The declarative, non-executable application of a Design Pack to a Project through the AgentKogei CLI. It places the Design Contract at the Project root and makes it discoverable through the Project's agent instructions, but does not migrate an existing interface.
_Avoid_: download, copy

**Installed Pack**:
A Design Pack applied to a Project as its root Design Contract and agent-instruction reference. It remains usable without AgentKogei authentication or network access; a Project can have at most one Installed Pack at a time.
_Avoid_: hosted pack, linked pack

**Pack License**:
The terms declared by a Design Pack that govern how its contents may be used, modified, and shared. Access to a pack and permission to use it are separate concerns.
_Avoid_: access level, price, entitlement

**Pack Credential**:
A revocable authorization that lets one CLI installation retrieve Premium Design Packs on behalf of a Builder with Premium Access. It grants no billing or account-management authority.
_Avoid_: password, API key, session

**Interface System**:
The visual and behavioral rules spanning a product's marketing, authentication and onboarding, and application surfaces, including layout, components, interaction states, responsiveness, motion, and accessibility. It excludes product-specific workflows, information architecture, business logic, and copy.
_Avoid_: visual style, brand, app template

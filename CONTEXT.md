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
A versioned collection of agent-readable design direction that defines an Interface System. Its required entry point is a Design Contract and it may include supporting design resources.
_Avoid_: design.md, template, theme

**Design Contract**:
The `DESIGN.md` document through which an Installed Pack tells a Project's AI coding agents which Interface System to follow.
_Avoid_: prompt, style guide, rules file

**Open Design Pack**:
A complete Design Pack that anyone may discover and install without an AgentKogei account and whose contents may be freely used, modified, and shared under its open license.
_Avoid_: free pack, public pack

**Premium Design Pack**:
A commercially licensed Design Pack available only to Builders with Premium Access. Its paid value comes from greater creative distinctiveness, production depth, and supporting resources rather than withholding baseline quality.
_Avoid_: paid pack, private pack

**Premium Access**:
The annual subscription entitlement that allows one named Builder to install and update every Premium Design Pack in the Official Catalog across unlimited Projects while the subscription is active. Open Design Packs never require Premium Access.
_Avoid_: all access, purchase, ownership

**Project License**:
The lasting right for all collaborators to use a specific Premium Design Pack snapshot within the Project where it was installed while Premium Access was active, unless the underlying payment is refunded or reversed. The Project may be public without converting the pack into an Open Design Pack; the license does not include catalog access, reinstallation, updates, extraction for another Project, or reuse of the subscriber's credentials.
_Avoid_: ownership, permanent access, download license

**Official Catalog**:
The curated collection of Open and Premium Design Packs published and maintained by AgentKogei. It contains only first-party packs at launch.
_Avoid_: marketplace, store, registry

**Published Pack**:
A Design Pack admitted to the Official Catalog after meeting its completeness and quality requirements. Open and Premium Design Packs must meet the same publication standard.
_Avoid_: listing, teaser pack

**Pack Evaluation**:
The standardized generation, automated validation, and human review process that a Design Pack release must pass before it can become a Published Pack, including evidence that its reference implementation meets WCAG 2.2 Level AA.
_Avoid_: demo, preview, test

**Pack Preview**:
The public visual and descriptive evidence showing a Design Pack's Interface System, coverage, compatibility, and evaluation status without exposing its gated source resources.
_Avoid_: demo, sample pack, source

**Material Release**:
A new Published Pack or a substantial expansion of an existing pack with additional patterns, supporting resources, and Pack Evaluation coverage. Compatibility fixes and minor refinements are not Material Releases.
_Avoid_: update, patch, content drop

**Pack Release**:
An immutable, semantically versioned edition of a Design Pack. Patch releases preserve generated output, minor releases add compatible guidance or resources, and major releases may intentionally change a Project's interface.
_Avoid_: latest, update, revision

**Installation**:
The declarative, non-executable application of a Design Pack to a Project through the AgentKogei CLI so the Project's AI coding agents can follow its Interface System. It establishes guidance for future work but does not migrate an existing interface.
_Avoid_: download, copy

**Installed Pack**:
A local, versioned snapshot of a Design Pack applied to a Project. It remains usable without AgentKogei authentication or network access and changes only through an explicit update; a Project can have at most one Installed Pack at a time.
_Avoid_: hosted pack, linked pack

**Detached Pack**:
An Installed Pack whose source files a Builder has intentionally modified. It remains usable but cannot receive Pack Release updates until its local changes are reconciled.
_Avoid_: fork, broken pack, custom pack

**Stack Adapter**:
The part of a Design Pack that translates its Interface System into resources and conventions for a supported application framework and UI library combination.
_Avoid_: variant, port, framework pack

**Pack License**:
The terms declared by a Design Pack that govern how its contents may be used, modified, and shared. Access to a pack and permission to use it are separate concerns.
_Avoid_: access level, price, entitlement

**Pack Source**:
A public or authenticated shadcn-compatible source from which the AgentKogei CLI can retrieve Design Packs.
_Avoid_: Official Catalog, publisher, repository

**Pack Credential**:
A revocable authorization that lets one CLI installation retrieve Premium Design Packs on behalf of a Builder with Premium Access. It grants no billing or account-management authority.
_Avoid_: password, API key, session

**Interface System**:
The visual and behavioral rules spanning a product's marketing, authentication and onboarding, and application surfaces, including layout, components, interaction states, responsiveness, motion, and accessibility. It excludes product-specific workflows, information architecture, business logic, and copy.
_Avoid_: visual style, brand, app template

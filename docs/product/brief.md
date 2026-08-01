# AgentKogei Product Brief

Status: implemented

## Outcome

AgentKogei gives AI coding agents durable design direction for a software Project. A Builder chooses one Design System from the public Official Catalog and installs its complete Design Contract locally. Every agent working in that Project can then follow the same visual and behavioral direction.

## Builder

AgentKogei serves a solo technical founder or member of a small product team who builds a web application with AI coding agents.

The product does not serve enterprise design system administration, client catalog management, or third party publishing.

## Product model

- A Design System is a versioned, self contained body of visual and behavioral direction.
- A Design System Release is delivered as one Design Contract named `DESIGN.md`.
- The Design Contract contains tokens, layout, component guidance, states, accessibility direction, and examples in Markdown.
- A Project can have at most one Installed Design System.
- Installation adds no manifest, hidden directory, or machine state.
- A Builder may edit an installed `DESIGN.md` directly.
- Installation governs future agent work. It does not redesign an existing interface.

## Direction boundary

Every Published Design System covers:

- Marketing, onboarding, and product interfaces
- Semantic color, typography, spacing, radius, elevation, and motion
- Layout and responsive behavior
- Component anatomy, variants, and interaction states
- Loading, empty, error, success, disabled, and destructive states
- Accessibility and reduced motion behavior
- Agent facing examples and a final validation checklist

A Design System does not prescribe product workflows, information architecture, business logic, or product copy.

## Official Catalog

The first party Official Catalog contains exactly four MIT licensed Design Systems:

| Design System | Direction |
| --- | --- |
| Foundation | Neutral, crisp, and highly legible B2B SaaS |
| Editorial | Warm, spacious, and content forward SaaS |
| Mono | Monochrome, high contrast interfaces for media and creative tooling |
| Command | Dark first, dense interfaces for developer and operations products |

Every Design System is public and complete. The catalog does not accept third party submissions.

## Publication standard

Every Design System Release must:

- Pass Design Contract structure and text safety validation
- Contain original direction or material the publisher has the right to use
- Target React or Next.js, Tailwind CSS v4, and shadcn/ui
- Cover representative screens, responsive behavior, light and dark modes, and reduced motion
- Demonstrate WCAG 2.2 Level AA in its reference implementation
- Pass repeatable generation tasks, automated checks, human visual review, and human rights review
- Publish a Design System Preview, evaluation evidence, and a changelog

Patch releases clarify or correct direction without materially changing output. Minor releases add compatible direction. Major releases may intentionally alter a Project interface and require migration notes. Each release is immutable at its exact catalog route.

## Web product

The web application presents the landing page, Official Catalog, documentation, and a Design System Preview for each of the four Published Design Systems. Current and exact Design Contract routes expose raw Markdown publicly.

The application is stateless. It requires no identity, authorization, persistent application data, or protected delivery path.

## CLI product

The AgentKogei CLI provides one operation:

```text
agentkogei add <design-system[@version]> [--yes] [--force]
```

The CLI:

- Retrieves current or exact Design System Releases anonymously from the Official Catalog
- Validates the complete Design Contract before changing the Project
- Previews the selected release and absolute files it will write
- Requires confirmation, or `--yes` for unattended consent
- Requires `--yes --force` for unattended replacement
- Writes one root `DESIGN.md` and one marked `AGENTS.md` reference
- Preserves unrelated Project files and existing agent instructions
- Leaves the Project unchanged after retrieval, validation, consent, conflict, or write failure
- Never executes supplied code, installs dependencies, or invokes a package manager
- Sends only the Design Contract request initiated by the Builder

Removing an Installed Design System is an ordinary Project edit: delete `DESIGN.md` and the marked `AGENTS.md` block.

## License

The MIT License covers all source code and all four Design Systems, including their Design Contracts and Design System Evaluation content. Installed Design Contracts remain bare design direction and do not repeat license, attribution, or provenance prose.

## Exclusions

- Third party catalog submissions or a marketplace
- Team administration and enterprise controls
- Project customization or hosted configuration
- Automatic redesign or migration
- More than one Installed Design System in a Project
- Manifests, supporting resources, executable hooks, or automatic dependency installation
- Managed status, automatic updates, or integrity tracking after Installation
- Frameworks beyond React or Next.js with Tailwind CSS v4 and shadcn/ui
- Runtime dependence on AgentKogei after Installation

<div align="center">
  <br />
  <h1>AgentKogei</h1>
  <strong>Durable, Project level design direction for AI coding agents through one Design Contract.</strong>
  <br />
  <br />
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/license-MIT-10b981?style=classic)](LICENSE)
![Design Contract](https://img.shields.io/badge/Design%20Contract-DESIGN.md-10b981?style=classic)
[![Last Update](https://img.shields.io/github/last-commit/arjayby/agentkogei?label=Last%20update&style=classic)](https://github.com/arjayby/agentkogei)
[![Live App](https://img.shields.io/badge/live-agentkogei.vercel.app-10b981?style=classic)](https://agentkogei.vercel.app)

</div>

AgentKogei publishes complete Design Systems for AI coding agents. Choose a direction from the public Design Systems collection, install its Design Contract in your Project, and give every agent the same visual and behavioral guidance.

[Browse the live Design Systems](https://agentkogei.vercel.app/design-systems)

## Design Systems

| Design System | Direction |
| --- | --- |
| **Foundation** | Neutral, crisp, and highly legible B2B SaaS |
| **Editorial** | Warm, spacious, and content forward SaaS |
| **Mono** | Monochrome, high contrast interfaces for media and creative tooling |
| **Command** | Dark first, dense interfaces for developer and operations products |

Every Published Design System and all AgentKogei source code are available under the [MIT License](LICENSE). Their Design Contracts and Design System Evaluation evidence are committed in `packages/design-systems/releases`.

## What is a Design Contract?

A Design Contract is a single, self contained `DESIGN.md` file at a Project root. It gives AI coding agents complete direction for tokens, layout, components, interaction states, motion, accessibility, and implementation examples.

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Tells coding agents how to work in the Project |
| `DESIGN.md` | Tells coding agents how the Project should look and behave |

An Installed Design System remains usable without AgentKogei or network access. Installation guides future agent work and does not automatically redesign an existing interface.

## Install a Design System

Run the CLI from a Project root:

```bash
npx agentkogei@latest add foundation
```

Equivalent `pnpm dlx`, `yarn dlx`, and `bunx` commands are also supported. A bare identity selects the current Design System Release. An exact selector such as `foundation@1.1.0` selects that immutable release.

Before changing the Project, the CLI previews the selected release and the files it will write. Installation writes one root `DESIGN.md` and one marked reference in `AGENTS.md`. It never executes supplied code, installs dependencies, creates hidden state, or replaces an existing Design Contract without explicit consent.

Every Design Contract is retrieved anonymously from the public AgentKogei Design Systems. The application has no authentication, billing, database, or persistent application state.

## Project structure

```text
agentkogei/
├── apps/
│   └── web/                 # Public Design Systems application
└── packages/
    ├── ui/                  # Shared interface components and styles
    ├── design-systems/      # CLI, validation, and Design System Releases
    └── config/              # Shared tooling configuration
```

## Development

Install dependencies and start the web application:

```bash
bun install
bun run dev
```

Open [http://localhost:3001](http://localhost:3001).

Run the complete technical verification:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

This checks formatting, types, production builds, the distributable CLI, and the full black box suite.

## Deployment

The public Design Systems application is configured for Vercel through `vercel.json`. Pull requests receive preview deployments, and merging `main` triggers the production deployment through the connected Vercel Git integration.

The CLI commands remain available for local deployment diagnostics and exceptional manual operation:

```bash
bun run deploy:setup
bun run deploy:check
bun run deploy
bun run deploy:prod
```

## License

The [MIT License](LICENSE) covers all source code and Design System content in this repository.

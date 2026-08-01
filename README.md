<div align="center">
  <br />
  <h1>🎨 AgentKogei</h1>
  <strong>Durable, project-level design direction for AI coding agents — through safe, versioned Design Pack installation.</strong>
  <br />
  <br />
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/license-MIT-10b981?style=classic)](LICENSE)
![Design Contract](https://img.shields.io/badge/Design%20Contract-DESIGN.md-10b981?style=classic)
[![Last Update](https://img.shields.io/github/last-commit/arjayby/agentkogei?label=Last%20update&style=classic)](https://github.com/arjayby/agentkogei)
[![Built with Better-T-Stack](https://img.shields.io/badge/built%20with-Better--T--Stack-000000?style=classic)](https://github.com/AmanVarshney01/create-better-t-stack)
[![Live App](https://img.shields.io/badge/live-agentkogei.vercel.app-10b981?style=classic)](https://agentkogei.vercel.app)

</div>

<br />

Install one **Design Pack** into your project, tell your AI coding agents "build this," and generate UI that stays visually consistent across every surface — marketing, auth, and the app itself.

Built with real design depth — semantic tokens, component anatomy, interaction states, responsive and motion rules, and accessibility behavior — for high-quality UI generation, not surface-level output.

👉 **[Try it live at agentkogei.vercel.app](https://agentkogei.vercel.app)**

## 📄 What is a Design Contract?

A **Design Contract** is a single, self-contained `DESIGN.md` file at your project root that AI agents read to generate consistent UI. It's the deliverable of a Design Pack.

It's just markdown. No Figma exports, no JSON schemas, no special tooling. Drop it into your project root and any AI coding agent instantly understands how your UI should look — tokens, guidance, and examples all live inside the one file. Markdown is the format LLMs read best, so there's nothing to parse or configure.

| File | Who reads it | What it defines |
| --- | --- | --- |
| `AGENTS.md` | Coding agents | How to build the project |
| `DESIGN.md` | Design agents | How the project should look and feel |

**AgentKogei delivers ready-to-use Design Contracts** as versioned Design Packs, installed with a single CLI command.

## ⚙️ How it works

1. **Pick a Design Pack** from the Official Catalog. Each pack is a complete, semantically versioned interface system covering marketing, authentication, and application surfaces.
2. **Install it** with the AgentKogei CLI. Installation is declarative and non-executable — it writes one `DESIGN.md` Design Contract to your project root and makes it discoverable through your agent instructions.
3. **Your agents follow the contract.** Edit `DESIGN.md` directly whenever you want. A project has at most one Installed Pack at a time.

Installation governs *future* agent work. It does not migrate or redesign an existing interface.

## 🧩 Core concepts

| Concept | What it is |
| --- | --- |
| **Design Pack** | A fixed, versioned interface system, delivered as a single Design Contract. |
| **Design Contract** | The `DESIGN.md` that tells a project's agents which interface system to follow. |
| **Official Catalog** | The curated, first party collection of public packs published by AgentKogei. |

📖 See [`CONTEXT.md`](CONTEXT.md) for the full domain vocabulary and [`docs/product/brief.md`](docs/product/brief.md) for the product brief.

## 🗂️ Official Catalog

| Pack | Direction |
| --- | --- |
| **Foundation** | Neutral, crisp, highly legible B2B SaaS |
| **Editorial** | Warm, spacious, content-forward SaaS |
| **Mono** | Monochrome, high contrast, content forward interfaces for media and creative tooling |
| **Command** | Dark first, dense, technical interfaces for developer and operations products |

## 🔒 Open source & access

The AgentKogei web application, CLI, Design Pack specification, and validators are available under the [MIT License](LICENSE). Every Design Pack in the Official Catalog is public, and the CLI installs its Design Contract anonymously.

## 🛠️ Tech stack

Built as a Turborepo monorepo with Next.js, React, Tailwind CSS, a shared shadcn/ui package, and Biome for linting and formatting.

```
agentkogei/
├── apps/
│   └── web/              # Public catalog (Next.js)
└── packages/
    ├── ui/               # Shared shadcn/ui components and styles
    ├── design-packs/     # Design Pack specification & validators
    └── config/           # Shared tooling config
```

## 🚀 Getting started

Install dependencies:

```bash
bun install
```

Then start the dev server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the app.

## ✅ Release candidate

Run the complete technical launch gate from the project root:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

This verifies formatting, types, production builds, the distributable CLI, and the full black-box suite. No database or commercial service credentials are required.

## 🎛️ UI customization

Shared shadcn/ui primitives live in `packages/ui`:

- Design tokens and global styles: `packages/ui/src/styles/globals.css`
- Shared primitives: `packages/ui/src/components/*`
- shadcn aliases / style config: `packages/ui/components.json` and `apps/web/components.json`

Add more shared primitives from the project root:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@agentkogei/ui/components/button";
```

For app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## ☁️ Deployment

Deploys target the public catalog on Vercel, configured via `vercel.json`. The application requires no authentication, billing, database, protected release, or diagnostics variables.

```bash
bun run deploy:setup     # Link this repo to a Vercel project (first-time)
bun run deploy:check     # Dry-run a deploy (no upload)
bun run deploy           # Preview deploy
bun run deploy:prod      # Production deploy
```

## 📜 Available scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start all applications in development mode |
| `bun run dev:web` | Start only the web application |
| `bun run build` | Build all applications |
| `bun run check` | Run Biome formatting and linting (write) |
| `bun run format:check` | Check formatting and lint rules without rewriting |
| `bun run check-types` | Check TypeScript types across all apps |
| `bun run launch:verify` | Run the complete technical launch gate |
| `bun run prepare` | Initialize Git hooks (Husky) |

---

<div align="center">
Licensed under the <a href="LICENSE">MIT License</a>. Design Pack use is governed by the website Terms.
</div>

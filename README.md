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
| **Open Design Pack** | A complete pack anyone can install without an account, free to use in any project. |
| **Premium Design Pack** | A private, access-gated pack — greater creative depth and breadth, same baseline quality. |
| **Premium Access** | An annual subscription entitling one Builder to every Premium pack, for unlimited projects. |
| **Official Catalog** | The curated, first-party collection of Open and Premium packs published by AgentKogei. |

📖 See [`CONTEXT.md`](CONTEXT.md) for the full domain vocabulary and [`docs/product/brief.md`](docs/product/brief.md) for the product brief.

## 🗂️ Launch catalog

| Access | Pack | Direction |
| --- | --- | --- |
| Open | **Foundation** | Neutral, crisp, highly legible B2B SaaS |
| Open | **Editorial** | Warm, spacious, content-forward SaaS |
| Premium | **Command** | Dark-first, dense, technical interfaces for developer & ops products |
| Premium | **Signal** | Bold geometry, expressive color, richer motion for AI & creative products |

Open and Premium packs meet the same completeness, accessibility, and evaluation standard. Premium value comes from greater creative distinctiveness and depth — never from withholding baseline quality.

## 🔒 Open source & access

The AgentKogei application, API, CLI, Design Pack specification, and validators are available under the [MIT License](LICENSE). Design Pack content is not separately licensed inside the files — how Open and Premium packs may be used is set out in the website Terms. Self-hosting the software does not grant access to Premium Design Packs.

## 🛠️ Tech stack

Built on [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack): a Turborepo monorepo running Next.js, oRPC end-to-end type-safe APIs, Drizzle ORM over PostgreSQL, Better-Auth (GitHub OAuth), TailwindCSS with a shared shadcn/ui package, and Biome for linting and formatting.

```
agentkogei/
├── apps/
│   └── web/              # Fullstack application (Next.js)
└── packages/
    ├── ui/               # Shared shadcn/ui components and styles
    ├── api/              # oRPC API layer / business logic
    ├── auth/             # Authentication configuration & logic
    ├── db/               # Drizzle schema & migrations
    ├── design-packs/     # Design Pack specification & validators
    ├── config/           # Shared tooling config
    └── env/              # Environment schema
```

## 🚀 Getting started

Install dependencies:

```bash
bun install
```

Copy `apps/web/.env.example` to `apps/web/.env` and replace its placeholders.

Create a GitHub OAuth App for the web application and set its authorization callback URL to:

```text
http://localhost:3001/api/auth/callback/github
```

Use the deployed origin in place of `http://localhost:3001` for preview and production OAuth Apps. GitHub is the only sign-in provider; email/password authentication is disabled.

### Database setup

This project uses PostgreSQL with Drizzle ORM.

1. Set up a PostgreSQL database.
2. Update `apps/web/.env` with your connection details.
3. Apply the schema:

```bash
bun run db:push
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

This verifies formatting, types, migrations, production builds, the distributable CLI, premium-resource isolation, and the full black-box suite. See [the MVP launch handoff](docs/launch-handoff.md) for the test boundary, distribution, manual commercial validation checklist, deployment migration command, and commercial terms.

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

Deploys target the web + server on Vercel, configured via `vercel.json`. Vercel Services share project environment variables, but deploys do not upload local `.env` files automatically — link the project and sync env before your first deploy.

```bash
bun run deploy:setup     # Link this repo to a Vercel project (first-time)
bun run env:preview      # Sync local env to the Vercel preview environment
bun run env:production   # Sync local env to the Vercel production environment
bun run deploy:check     # Dry-run a deploy (no upload)
bun run deploy           # Preview deploy
bun run deploy:prod      # Production deploy
```

Pass Vercel CLI flags to the env sync commands directly, e.g. `bun run env:production --scope your-team`. For more detail, see [Deploying to Vercel](https://www.better-t-stack.dev/docs/guides/vercel).

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
| `bun run db:push` | Push schema changes to the database |
| `bun run db:generate` | Generate database client/types |
| `bun run db:migrate` | Run database migrations |
| `bun run db:check` | Validate the committed Drizzle migration journal |
| `bun run db:studio` | Open the database studio UI |
| `bun run prepare` | Initialize Git hooks (Husky) |

---

<div align="center">
Licensed under the <a href="LICENSE">MIT License</a>. Design Pack use is governed by the website Terms.
</div>

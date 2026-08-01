# agentkogei

Give your AI coding agents one durable Design Contract.

The `agentkogei` package installs a Design System from the public Official Catalog. The catalog contains four complete Design Systems:

| Design System | Direction |
| --- | --- |
| Foundation | Neutral, crisp, and highly legible B2B SaaS |
| Editorial | Warm, spacious, and content forward SaaS |
| Mono | Monochrome, high contrast interfaces for media and creative tooling |
| Command | Dark first, dense interfaces for developer and operations products |

## Install a Design System

Run one of these commands from your Project root. Each invokes the same executable.

```sh
npx agentkogei@latest add foundation
pnpm dlx agentkogei@latest add foundation
yarn dlx agentkogei@latest add foundation
bunx agentkogei@latest add foundation
```

`agentkogei@latest` selects the newest CLI. A bare identity such as `foundation` selects the current Design System Release. An exact selector such as `foundation@1.1.0` selects that immutable release.

The CLI previews the Design System Release and absolute files it will write, then asks before changing anything. Pass `--yes` for unattended consent. Replacing an existing `DESIGN.md` unattended requires `--yes --force`.

Installation writes one root `DESIGN.md` and one clearly marked reference in `AGENTS.md`. It adds no hidden directory, manifest, or machine state.

## Public retrieval

Every Design System is retrieved anonymously from the Official Catalog. The CLI sends only the requested Design Contract selector. It sends no Project identity, path, Git remote, file content, prompt, generated interface, or dependency list.

## Requirements

Node.js 20 or newer. Bun is not required to run the CLI.

## Remove a Design System

Delete `DESIGN.md` and the marked AgentKogei block in `AGENTS.md`. AgentKogei keeps no record of the document after Installation.

## License

The MIT License covers this package and all four Design Systems in the Official Catalog. Installed Design Contracts remain bare design direction and do not repeat license, attribution, or provenance prose.

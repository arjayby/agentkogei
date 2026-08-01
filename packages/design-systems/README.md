# agentkogei

Give your AI coding agents one durable Design Contract.

`agentkogei add <design-system>` retrieves a Design System from the Official Catalog and
writes it into your Project as a single root `DESIGN.md`, plus one clearly
marked reference in `AGENTS.md` so your agents find it. Nothing else is
installed: no hidden directory, no manifest, no machine state.

## Install a Design System

Run one of these from your Project root. They all invoke the same executable.

```sh
npx agentkogei@latest add foundation
pnpm dlx agentkogei@latest add foundation
yarn dlx agentkogei@latest add foundation
bunx agentkogei@latest add foundation
```

`agentkogei@latest` selects the newest CLI, not the newest Design System. A bare
identity such as `foundation` selects the Design System's current Design System Release;
`foundation@1.1.0` selects that exact release forever.

The CLI previews the Design System, its Design System Release, and the absolute files it
will write, then asks before changing anything. Pass `--yes`
to consent without a prompt, and `--yes --force` to replace an existing
`DESIGN.md` unattended.

## Anonymous retrieval

Every Design System is retrieved anonymously from the public Official Catalog.
The CLI sends only the requested Design Contract selector and never stores an
account credential or sends a diagnostic or Installation event.

## Requirements

Node.js 20 or newer. Bun is not required to run the CLI.

## Removing a Design System

Delete `DESIGN.md` and the marked AgentKogei block in `AGENTS.md`. There is no
removal command, because AgentKogei keeps no record of what you have since
edited.

## License

MIT. Installed Design Systems are bare design direction and carry no license text.

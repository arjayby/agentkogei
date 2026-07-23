# agentkogei

Give your AI coding agents one durable Design Contract.

`agentkogei add <pack>` retrieves a Design Pack from the Official Catalog and
writes it into your Project as a single root `DESIGN.md`, plus one clearly
marked reference in `AGENTS.md` so your agents find it. Nothing else is
installed: no hidden directory, no manifest, no machine state.

## Install a Design Pack

Run one of these from your Project root. They all invoke the same executable.

```sh
npx agentkogei@latest add foundation
pnpm dlx agentkogei@latest add foundation
yarn dlx agentkogei@latest add foundation
bunx agentkogei@latest add foundation
```

`agentkogei@latest` selects the newest CLI, not the newest Design Pack. A bare
identity such as `foundation` selects the Design Pack's current Pack Release;
`foundation@1.1.0` selects that exact release forever.

The CLI previews the Design Pack, its Pack Release, and the absolute files it
will write, then asks before changing anything. Pass `--yes`
to consent without a prompt, and `--yes --force` to replace an existing
`DESIGN.md` unattended.

## Open and Premium Design Packs

Both use the same `add` command; only the access requirement differs. An Open
Design Pack installs without an AgentKogei account. A Premium Design Pack needs
active Premium Access, and `add` starts browser authorization automatically when
the CLI holds no Pack Credential, then resumes the same Installation.

## Requirements

Node.js 20 or newer. Bun is not required to run the CLI.

## Removing a Design Pack

Delete `DESIGN.md` and the marked AgentKogei block in `AGENTS.md`. There is no
removal command, because AgentKogei keeps no record of what you have since
edited.

## License

MIT. Installed Design Packs are bare design direction and carry no license text;
how Open and Premium packs may be used is set out in the AgentKogei website Terms.

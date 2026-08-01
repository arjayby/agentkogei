# Deliver each Design System as one Design Contract

AgentKogei delivers each Design System Release from the Official Catalog as raw Markdown and installs it as one root `DESIGN.md`. Each contract directly targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Installation adds no manifest, framework adapter, executable hook, supporting resource, or hidden state.

The CLI may maintain one marked `AGENTS.md` reference for discovery. `add` is its only operation. It resolves current or exact Official Catalog releases, previews and confirms creation or replacement, and requires `--yes --force` for unattended replacement. Removal is manual deletion of `DESIGN.md` and its marked `AGENTS.md` reference.

The CLI retrieves the selected Design Contract before mutation and never sends Project names, paths, Git remotes, file contents, prompts, generated interfaces, or dependency lists. The installed document remains usable without AgentKogei or network access.

This decision favors one portable, inspectable artifact and one operation over managed status, automatic updates, integrity tracking, supporting assets, third party distribution, and framework neutral adapters.

# MVP launch handoff

## Release candidate verification

Install the locked dependencies, then run the verification command from the Project root:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

`launch:verify` checks formatting, TypeScript, production builds, and the full test suite. It requires no database, migration, provider substitute, or commercial service credential.

The Playwright suite builds and starts the public Next.js catalog, packs the publishable `agentkogei` tarball, and runs both against the controlled public Official Catalog and temporary Projects. Every CLI journey launches the built executable on Node.js. The package runner matrix installs the tarball through `npx`, `pnpm dlx`, modern `yarn dlx`, and `bunx`.

## Launch smoke boundary

The black box suite observes browser visible state, HTTP responses, CLI output and exit status, resulting Project files, and outbound CLI requests. It covers:

* public discovery, Pack Previews, compatibility, Pack Evaluation, retrieval, and Installation across Foundation, Editorial, Mono, and Command
* anonymous current and exact Design Contract routes
* the absence of retired account, billing, authorization, diagnostics, and provider test routes
* Installation safety, privacy, and package runner support
* theme behavior, responsive layouts, and WCAG 2.2 Level AA checks on public pages

## Publishing the CLI

The verification run leaves a publishable artifact. Uploading it is a separate release operation that needs npm publishing authority for the `agentkogei` name.

```bash
bun run --cwd packages/design-packs distribution:pack
npm publish packages/design-packs/.distribution/agentkogei.tgz
```

The tarball carries one `agentkogei` executable, declares Node.js 20 or newer, and contains no validator executable, library entry point, runtime dependency, or Pack Release. Publish only from a `launch:verify` run whose package runner matrix passed, then tag the released commit.

## Handoff status

* Technical release candidate: verify with `bun run launch:verify`.
* Pack Evaluation and rights review: retain the four Pack Release reports and approval records.

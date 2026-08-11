# Launch handoff

## Release candidate verification

Install the locked dependencies, then run the verification command from the Project root:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

`launch:verify` checks formatting, tracked release surfaces, TypeScript, production builds, and the full test suite. It requires no database, migration, or external service credential.

The Playwright suite builds and starts the public Next.js Design Systems application, creates the publishable `agentkogei` archive, and runs both against a controlled Official Catalog and temporary Projects. Every CLI journey launches the built executable on Node.js. The runner matrix installs the archive through `npx`, `pnpm dlx`, modern `yarn dlx`, and `bunx`. Request inspection runs against that packed archive and proves it sends only the anonymous Design Contract request.

## Launch smoke boundary

The black box suite observes browser visible state, HTTP responses, CLI output and exit status, resulting Project files, and outbound CLI requests. It covers:

- Public discovery, Design System Previews, compatibility, Design System Evaluation, retrieval, and Installation for every discovered Published Design System
- Anonymous current and exact Design Contract routes
- The absence of removed identity, payment, authorization, diagnostics, and provider test routes
- Installation safety, privacy, and supported package runners
- Theme behavior, responsive layouts, and WCAG 2.2 Level AA checks on public pages

## Publish the CLI

The verification run leaves a publishable artifact. Uploading it is a separate release operation that requires npm publishing authority for the `agentkogei` name.

```bash
bun run --cwd packages/design-systems distribution:package
npm publish packages/design-systems/.distribution/agentkogei.tgz
```

The archive contains one `agentkogei` executable, declares Node.js 20 or newer, and contains no validator executable, library entry point, runtime dependency, or Design System Release. Publish only from a successful `launch:verify` run, then tag the released commit.

## Owner managed remote cleanup

Remote Polar, Neon, GitHub OAuth, Vercel variable, and other historical vendor configuration is not changed from this repository. The owner must inspect and remove those remote resources manually after the repository implementation is complete.

## Handoff status

- Technical release candidate: verify with `bun run launch:verify`.
- Design System Evaluation and rights review: retain the evaluation reports and approval records for every Published Design System.

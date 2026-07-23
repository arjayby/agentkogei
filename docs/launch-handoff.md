# MVP launch handoff

Issue #19 assembles the MVP tracer bullets into one release-candidate boundary. The handoff is ready for technical review and commercial launch.

## Release-candidate verification

Install the locked dependencies, then run the single verification command from the Project root:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

`launch:verify` checks formatting, TypeScript, committed migrations, production builds, premium-resource artifact isolation, and the full test suite. The Playwright suite builds the Next.js web/API product, starts that production build, packs the publishable `agentkogei` tarball, and runs both together against deterministic GitHub and Polar substitutes, a controlled Official Catalog, an isolated Postgres-compatible database, and temporary Projects. Every CLI journey launches the built `agentkogei` executable on Node.js, and the runner matrix installs the tarball itself to complete an Open Installation through `npx`, `pnpm dlx`, modern `yarn dlx`, and `bunx`.

Before deploying against a new database, execute the committed migrations against an isolated preview database and retain the command output with the release evidence:

```bash
DATABASE_URL=postgresql://preview-database bun run db:migrate
```

Do not point this check at production first. The migration journal can be checked without a database through `bun run db:check` and is included in `launch:verify`.

## Launch smoke boundary

The black-box suite observes only browser-visible state, HTTP responses, CLI output and exit status, resulting Project files, and persisted effects exposed by product operations. It covers:

- discovery, Pack Previews, access class, React/Next.js–Tailwind CSS v4–shadcn/ui compatibility, Pack Evaluation, retrieval, and Installation across Foundation, Editorial, Command, and Signal;
- complete Open Design Packs and the greater distinctiveness and supporting depth of Premium Design Packs without reserving baseline safety, completeness, or accessibility for Premium;
- deterministic GitHub authorization and Polar Premium Access transitions without live third-party accounts;
- a controlled Official Catalog serving Open and Premium Design Contracts, plus disposable Projects;
- artifact, cache, source-map, unauthenticated-response, and CLI-output checks for raw Premium Design Pack resources; and
- default-off diagnostics and the disclosed opt-in payload.

## Publishing the CLI

The repository leaves a verified publishable artifact; uploading it is a separate release operation that needs npm publishing authority for the unclaimed `agentkogei` name.

```bash
bun run --cwd packages/design-packs distribution:pack
npm publish packages/design-packs/.distribution/agentkogei.tgz
```

The tarball carries one `agentkogei` executable, declares Node.js 20 or newer, and contains no validator executable, library entry point, runtime dependency, or Design Pack Release. Publish only from a `launch:verify` run whose runner matrix passed, and tag the released commit.

## Software license and distribution boundary

| Artifact | Terms | Distribution |
| --- | --- | --- |
| Web application, API, CLI, Design Pack specification, validators | MIT | Root `LICENSE`; the packed CLI also carries `packages/design-packs/LICENSE` |
| Open Design Pack content | Free to install and use in any Project | Delivered as bare `DESIGN.md`; the use grant is stated on the website Terms page |
| Premium Design Pack content | Private and access-gated | Redistribution limits are stated on the website Terms page; raw resources do not enter this public source distribution or public build output |

Self-hosting the MIT software does not grant Premium Design Pack resources, Premium Access, Pack Credentials, or permission to reproduce the Official Catalog. A genuine public end-product Project may contain its lawfully Installed Pack snapshot without authorizing extraction.

## Commercial validation checklist

Keep this validation manual. Do not add mandatory telemetry, inspect a Project without explicit permission, or transmit Project identity or content through the CLI.

- [ ] Record 10 paid annual Premium Access subscribers using the Merchant of Record records as the source of truth.
- [ ] Record explicit review permission from at least five of those subscribers before viewing their Projects.
- [ ] For each permitted Project, capture the Builder's before/after account of visual inconsistency or design rework, the reviewed Pack Release, review date, and a short human assessment. Store no Project source in AgentKogei diagnostics.
- [ ] Count a Project as improved only when the Builder and reviewer agree there was a material reduction in visual inconsistency or design rework.
- [ ] Continue investment only if at least four of the five reviewed Projects meet that improvement bar.
- [ ] Treat stars, traffic, retrievals, and Pack Preview engagement as supporting signals, not substitutes for the paid outcome.

## Commercial terms

The website Terms (`/terms`) and Privacy (`/privacy`) pages publish the commercial terms for the Service:

- the open-pack use grant and premium redistribution limits;
- USD $99 annual price, one named Builder, every Premium Design Pack in the Official Catalog, unlimited Projects, no trial, and at least one Material Release per quarter;
- no-voluntary-refund wording and mandatory, card-network, Polar-issued, refund, and reversal consequences;
- expiration, renewal, reinstallation, update, offline-use, and no-runtime-DRM boundaries;
- genuine public end-product Project permission and the extraction, resale, republishing, credential-sharing, and cross-Project restrictions;
- the self-hosting boundary between MIT software and Premium Design Pack content.

Production checkout runs whenever `POLAR_SERVER=production` and a `POLAR_PREMIUM_ACCESS_PRODUCT_ID` are configured; sandbox checkout remains available for deterministic validation.

## Handoff status

- Technical release candidate: verify with `bun run launch:verify`.
- Preview database migrations: run and retain `bun run db:migrate` output against the deployment candidate.
- Human Pack Evaluation and rights review: retain the four Pack Release reports and approval records.
- Commercial launch: **ready** — Terms and Privacy published; production checkout enabled once Polar production credentials are configured.

# Launch handoff

## Release candidate verification

Install the locked dependencies, then run the verification command from the Project root:

```bash
bun install --frozen-lockfile
bun run launch:verify
```

`launch:verify` checks formatting, tracked release surfaces, TypeScript, production builds, and the full test suite. It requires no database, migration, or external service credential.

The Playwright suite builds and starts the public Next.js Design Systems application, creates the publishable `agentkogei` archive, and runs both against a controlled Official Catalog source and temporary Projects. Every CLI journey launches the built executable on Node.js. The runner matrix installs the archive through `npx`, `pnpm dlx`, modern `yarn dlx`, and `bunx`. Request inspection runs against that packed archive and proves it sends only the anonymous Design Contract request.

The release audit rejects stale production domains, inconsistent public collection language in current public documentation and application source, invalid canonical package metadata, a narrowed `launch:verify` entry point, and Design System Release artifacts that do not match the repository controlled immutable digest set. Historical ADR terminology and accurate internal collection identifiers remain valid.

## Launch smoke boundary

The black box suite observes browser visible state, HTTP responses, CLI output and exit status, resulting Project files, and outbound CLI requests. It covers:

- Canonical metadata, Guides, methodology, crawler controls, sitemap membership, structured data, machine resources, and social previews
- The approved analytics interactions with no Project, Builder, or caller supplied event properties
- Discovery of every Published Design System from validated release data, including an isolated fixture that is not named in application code
- Public discovery, Design System Previews, compatibility, Design System Evaluation, retrieval, and Installation for every discovered Published Design System
- Anonymous current and exact Design Contract routes
- The absence of removed identity, payment, authorization, diagnostics, and provider test routes
- Installation safety, privacy, and supported package runners
- Theme behavior, responsive layouts, and WCAG 2.2 Level AA checks on public pages

These checks establish repository guarantees only. They do not verify production DNS, redirects, search engine accounts, production analytics settings, GitHub repository settings, or a deployment that happens after the tested commit.

## Publish the CLI

The verification run leaves a publishable artifact. Uploading it is a separate release operation that requires npm publishing authority for the `agentkogei` name.

```bash
bun run --cwd packages/design-systems distribution:package
npm publish packages/design-systems/.distribution/agentkogei.tgz
```

The archive contains one `agentkogei` executable, declares Node.js 20 or newer, and contains no validator executable, library entry point, runtime dependency, or Design System Release. Publish only from a successful `launch:verify` run, then tag the released commit.

## Owner managed launch checklist

Every item below is pending until the owner performs it in the named external service and records evidence. None is performed by `launch:verify` or by issue 145.

- [ ] In Vercel, assign `agentkogei.vercel.app` as the production domain and confirm domain verification succeeds.
- [ ] Redirect `www.agentkogei.vercel.app` to `https://agentkogei.vercel.app` while preserving the path and query string.
- [ ] Redirect the Vercel production hostname to `https://agentkogei.vercel.app` while preserving the path and query string.
- [ ] Confirm the apex, `www`, and Vercel hostname behavior with direct HTTP requests after DNS and certificate propagation.
- [ ] In Google Search Console, verify the `agentkogei.vercel.app` domain property and submit `https://agentkogei.vercel.app/sitemap.xml`.
- [ ] In Bing Webmaster Tools, verify or import the `agentkogei.vercel.app` site and submit `https://agentkogei.vercel.app/sitemap.xml`.
- [ ] In Vercel, enable Web Analytics for the production Project and confirm only the approved page views and Installation journey events arrive.
- [ ] On GitHub, set the repository website to `https://agentkogei.vercel.app` and add the topics `design-systems`, `ai-coding-agents`, and `design-contract`.

Search Console and Webmaster Tools confirm access and sitemap receipt. They do not promise indexing position, ranking, traffic, citation, or post launch performance.

## Owner managed remote cleanup

Remote Polar, Neon, GitHub OAuth, Vercel variable, and other historical vendor configuration is not changed from this repository. The owner must inspect and remove those remote resources manually after the repository implementation is complete.

## Handoff status

- Repository release candidate: verified only when `bun run launch:verify` succeeds on the exact commit to be released.
- Published Design System guarantees: automated validation, immutable release checks, and retained evaluation evidence are repository controlled.
- Production deployment and npm publication: not performed by issue 145.
- Production domains, redirects, verification, search engine setup, sitemap submission, analytics enablement, and GitHub topics: pending owner actions until the checklist is completed.
- Ranking, traffic, citations, and post launch evaluation: neither performed nor promised by this handoff.

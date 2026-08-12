---
name: add-design-system
description: "Create one complete original Design System from a maintainer supplied URL or image, add its final 1.0 release to the AgentKogei Official Catalog, validate the website integration, and open a pull request. Use when adding a new first party Design System and its landing page, collection, preview, and contract routes in one uninterrupted workflow."
---

# Add a Design System

Turn exactly one URL or image into one final Design System Release and one pull request. Do not create a candidate, request approval, deploy with the Vercel CLI, or publish the npm package. A merge to `main` is the publication boundary and Vercel production trigger.

## 1. Inspect the Design Reference

Use browser tooling for a URL and image inspection tooling for an image. State the inspected scope in the final report.

For a URL:

1. Inspect the supplied page from top to bottom. Scroll incrementally until the true page footer or end is visible so lazy content loads.
2. Follow real, same origin navigation to two or three additional publicly accessible pages when available. Prioritize sign in or authentication, product or dashboard, pricing, documentation, onboarding, and settings surfaces.
3. Scroll every additional page to its bottom. Inspect responsive navigation or alternate routes when they materially reveal the system.
4. Never sign in, create an account, submit a consequential form, bypass access controls, or invent unavailable pages.
5. If fewer than two useful additional pages exist, continue and record which routes were available.

Retain only normalized HTTPS origin and paths. Remove queries, fragments, credentials, screenshots, downloaded pages, copied assets, and raw page content after inspection.

Extract general characteristics such as density, contrast, geometry, hierarchy, typography roles, spatial rhythm, component behavior, responsive changes, and motion character. Use them as inspiration for original direction. Exclude copied assets, product identity, distinctive compositions, recognizable product replication, and imitation of living designers.

Stop only when the reference is inaccessible or does not provide enough visual evidence to create a responsible original direction.

## 2. Choose the direction

Inspect `packages/design-systems/releases`. Choose a new name and lowercase hyphenated identity that appears nowhere in the Official Catalog. New identities start at `1.0`.

Create the direction without an approval pause. Define the intended product fit, unsuitable uses, original system signature, three to five principles, transformed reference traits, and the five excluded elements. Do not reproduce the reference product.

Create a conventional branch named `feat/add-<identity>-design-system` before writing tracked files. Preserve unrelated work. If the current worktree is not clean, use a separate Git worktree rather than mixing changes.

## 3. Build the final release

Read [design-contract-standard.md](references/design-contract-standard.md) and [release-format.md](references/release-format.md) completely. Create a temporary staging directory on the same filesystem as `packages/design-systems` containing only:

```text
DESIGN.md
design-system-evaluation.json
evaluation/report.json
```

Add other regular evidence files only when `evaluation.evidence` declares them. Keep the Design Contract inert, self contained, original, and free of reference or evaluation dependencies.

Use schema version `5.0`. Generate a complete structured Preview for every website specimen. Run the evaluation described in `release-format.md`, record truthful results, and pin the exact SHA 256 digest of `DESIGN.md`. A failed check stops the workflow. Never label an unrun check as passed.

Finalize the release atomically:

```text
bun .agents/skills/add-design-system/scripts/finalize-release.ts <staging-directory> --releases packages/design-systems/releases
```

Resolve every validation error in staging, then run the command again. Never edit another Published Design System or overwrite an existing identity.

## 4. Integrate the website

Regenerate the Official Catalog:

```text
bun run --cwd apps/web contracts:build
```

The generated catalog must make the new system appear through shared renderers on the landing page, `/design-systems`, `/design-systems/<identity>`, `/contracts/<identity>`, and `/contracts/<identity>/1.0`. Do not add identity specific React branches.

Run:

```text
bun run launch:verify
```

Fix failures without weakening checks or changing existing release bytes. Confirm the diff contains only the new release, generated catalog artifacts, and any directly required test updates.

## 5. Open the pull request

Commit with `feat: add <name> design system`. Push the branch and open a ready pull request targeting `main`. Summarize the inspected pages, original transformation, release identity, validation, website routes, and the fact that merging triggers Vercel production deployment.

Do not run `bun run deploy:prod`. Do not wait for or claim a production deployment before merge. Report the pull request URL and any Vercel preview URL that is already available.

Remove the temporary staging directory before finishing.

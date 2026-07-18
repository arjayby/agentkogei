# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list` with appropriate label and state filters
- **Comment**: `gh issue comment <number> --body "..."`
- **Apply/remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares one number space across issues and pull requests. Resolve an ambiguous reference with `gh pr view <number>` and fall back to `gh issue view <number>`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

- **Map**: One issue labelled `wayfinder:map`.
- **Child ticket**: An issue linked as a GitHub sub-issue, labelled `wayfinder:<type>`.
- **Blocking**: Use GitHub's native issue dependencies. If unavailable, add a `Blocked by: #<n>` line to the issue body.
- **Frontier**: Select the first open, unblocked, and unassigned child in map order.
- **Claim**: `gh issue edit <number> --add-assignee @me`
- **Resolve**: Comment with the answer, close the child, and append a context pointer to the map's Decisions-so-far.

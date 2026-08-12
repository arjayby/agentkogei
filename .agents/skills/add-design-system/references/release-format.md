# Final release format

The staging directory is already the complete release. It contains no candidate state or approval record.

## Design System Evaluation record

Create `design-system-evaluation.json` with `schemaVersion` set to `5.0`. Use `packages/design-systems/src/design-system-evaluation.ts` as the canonical schema and a current Published Design System only as a structural example. Do not reuse another system's prose, tokens, specimens, or identity.

Set these fixed release values:

```json
{
  "schemaVersion": "5.0",
  "publisher": "AgentKogei",
  "designSystemRelease": {
    "version": "1.0",
    "publishedAt": "YYYY-MM-DD",
    "immutable": true
  },
  "compatibility": {
    "frameworks": ["react", "nextjs"],
    "react": ">=18 <20",
    "nextjs": ">=15 <17",
    "tailwind": ">=4 <5",
    "ui": "shadcn/ui"
  },
  "evaluation": {
    "status": "passed",
    "standard": "WCAG 2.2 Level AA",
    "screens": ["marketing", "authentication", "onboarding", "dashboard", "table", "form", "settings", "states"],
    "viewports": ["1440x900", "390x844"],
    "colorSchemes": ["light", "dark"],
    "reducedMotion": true,
    "agentGenerationRuns": 1,
    "automatedChecks": ["structure", "accessibility", "responsive overflow", "color contrast"],
    "evidence": ["evaluation/report.json"]
  },
  "changelog": {
    "summary": "Initial Design System Release.",
    "breaking": false,
    "migrationNotes": null
  }
}
```

Add `id`, `designSystem`, the exact `designContract.sha256`, and the complete `preview`. Set `preview.route` to `/design-systems/<identity>`. Set `preview.order` after the highest current order.

The Preview must define every schema category:

1. Signature, Design System Mark, typography, and composition
2. Semantic light and dark tokens
3. Semantic color usage, type scale, spacing, layout, responsive behavior, and geometry
4. Buttons, links, forms, inputs, cards, panels, and navigation
5. Data display, feedback, dialogs, and destructive actions
6. Motion, reduced motion, and accessibility
7. Marketing, authentication, onboarding, dashboard, table, form, settings, and state specimens
8. Evidence presentation and theme geometry

Every specimen must express the new system rather than generic placeholder copy.

## Evaluation report

Create `evaluation/report.json` with this shape:

```json
{
  "schemaVersion": "2.0",
  "status": "passed",
  "designSystem": "Name",
  "designReference": {
    "kind": "url",
    "locator": "https://example.com/path",
    "inspectedPages": [
      {
        "path": "/path",
        "scope": "Visible regions inspected from header through footer",
        "reachedBottom": true
      }
    ],
    "additionalPages": {
      "inspected": 0,
      "limitation": "No other useful public same origin pages were available"
    },
    "generalizedTraits": ["General observation"],
    "transformation": "How the observations became original direction",
    "excludedElements": [
      "copied assets",
      "product identity",
      "distinctive compositions",
      "recognizable product replication",
      "imitation of living designers"
    ]
  },
  "screens": ["marketing", "authentication", "onboarding", "dashboard", "table", "form", "settings", "states"],
  "coverage": {
    "viewports": ["1440x900", "390x844"],
    "colorSchemes": ["light", "dark"],
    "reducedMotion": true
  },
  "automatedChecks": {
    "structure": "passed",
    "accessibility": "passed",
    "responsiveOverflow": "passed",
    "colorContrast": "passed"
  },
  "originalityReview": {
    "status": "passed",
    "notes": "Why the result is original and safe to publish under MIT"
  }
}
```

For an image, use `kind: "image"`, `locator: "user-supplied-image"`, and one inspected scope instead of page paths. Never store raw reference content.

Record only checks actually performed. Before finalization, exercise structure, accessibility, responsive overflow, and color contrast against an isolated implementation of the Design System Preview. After integration, `launch:verify` independently checks the complete website and release. If any check fails, keep the release out of the pull request until fixed and rerun.

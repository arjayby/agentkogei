# Publication proposal metadata

Create one UTF 8 JSON file with this strict shape. It supplies public presentation data only. Evaluation results, evidence paths, compatibility, identity, version, and the Design Contract digest come from validated workflow state and cannot be supplied here.

```json
{
  "schemaVersion": "1.0",
  "publisher": "AgentKogei",
  "publishedAt": "YYYY-MM-DD",
  "preview": {
    "order": 5,
    "summary": "Public summary",
    "intendedFit": "Intended product fit",
    "surfaces": ["marketing", "authentication", "onboarding", "dashboard", "table", "form", "settings", "states"],
    "route": "/catalog/identity",
    "signature": {
      "label": "Short label",
      "headline": "Signature headline",
      "principles": ["Principle one", "Principle two", "Principle three"]
    },
    "tokens": {
      "light": {
        "background": "#ffffff", "foreground": "#111111", "card": "#ffffff", "muted": "#eeeeee", "mutedForeground": "#555555", "border": "#cccccc", "primary": "#2233aa", "primaryForeground": "#ffffff", "destructive": "#aa2222", "success": "#227744", "warning": "#886611", "info": "#225588", "ring": "#3344bb"
      },
      "dark": {
        "background": "#111111", "foreground": "#ffffff", "card": "#222222", "muted": "#333333", "mutedForeground": "#bbbbbb", "border": "#555555", "primary": "#99aaff", "primaryForeground": "#111111", "destructive": "#ff8888", "success": "#77cc99", "warning": "#ddbb66", "info": "#88aadd", "ring": "#aabbff"
      }
    },
    "typography": { "display": "sans", "body": "sans", "accent": "mono", "scale": "compact" },
    "geometry": { "density": "compact", "radius": "soft", "border": "defined", "elevation": "flat" }
  },
  "changelog": {
    "summary": "Initial Design System Release.",
    "breaking": false,
    "migrationNotes": null
  }
}
```

Colors must be six digit hexadecimal values or supported OKLCH values. Preview surfaces must be complete and unique. The proposal command creates only `DESIGN.md`, `design-system-evaluation.json`, the generated evaluation report, and the raw evidence declared by that record.

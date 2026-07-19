# React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter

This Stack Adapter translates Editorial without changing its framework-neutral Interface System.

1. Import `tokens.css` into the Project's existing Tailwind CSS v4 global stylesheet and map its variables to the Project's semantic theme in `@theme inline`. Map both interface and display font roles to locally available Project stacks.
2. Keep Server Components as the default in Next.js. Add `"use client"` only for browser state, effects, event handlers, or client-only APIs.
3. Compose existing shadcn/ui primitives before custom components. Use Button, Card, Table, Field, Alert, Empty, Skeleton, Dialog, Sheet, Dropdown Menu, Tooltip, Breadcrumb, and Separator according to their documented anatomy.
4. Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `ring-ring`; never place Editorial OKLCH values in component class names.
5. Express the editorial grid with CSS Grid, `max-w-*`, `gap-*`, and deliberate column spans. Keep DOM order meaningful when using offsets. Use `prose` only if the Project already owns and configures it; this Pack adds no dependency.
6. Keep serif display utilities away from controls, tables, code, and dense metadata. Avoid one-off colors, arbitrary shadows, oversized radii, and remote font imports.
7. Dependencies are guidance only. The Builder chooses and runs package-manager commands; this Pack has no hooks, scripts, executable files, or remote assets.

Compatibility: React 19 or Next.js 16, Tailwind CSS 4.x, and shadcn/ui with either Radix or Base primitives. The Design Contract remains valid for React 18 and Next.js 15, while the evaluated baseline is React 19 / Next.js 16.

# React / Next.js, Tailwind CSS v4, and shadcn/ui Stack Adapter

This adapter translates Foundation without changing its framework-neutral Interface System.

1. Import `tokens.css` into the Project's existing Tailwind CSS v4 global stylesheet and map the Foundation variables to the Project's semantic theme variables in `@theme inline`.
2. Keep Server Components as the default in Next.js. Add `"use client"` only to components that need browser state, effects, event handlers, or client-only APIs.
3. Compose existing shadcn/ui primitives before adding custom components. Use Button, Card, Table, Field, Alert, Empty, Skeleton, Dialog, Sheet, Dropdown Menu, and Tooltip according to their documented anatomy.
4. Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `ring-ring`; do not place Foundation's OKLCH values directly in component class names.
5. Use `gap-*` for layout spacing, `size-*` for equal dimensions, built-in component variants, and `cn()` for conditional classes. Avoid one-off color, type, radius, and shadow overrides.
6. Dependencies are guidance only. The Builder chooses and runs package-manager commands; this pack contains no hooks, scripts, executable files, or remote imports.

Compatibility: React 19 or Next.js 16, Tailwind CSS 4.x, and shadcn/ui with either Radix or Base primitives. The Design Contract remains valid for React 18 and Next.js 15, but this release's evaluated adapter baseline is React 19 / Next.js 16.

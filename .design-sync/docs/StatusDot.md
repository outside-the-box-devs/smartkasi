---
category: Feedback & Status
---

# Status Dot

A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.

**Import:** `import {StatusDot} from '@astryxdesign/core/StatusDot';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'success' | 'warning' | 'error' | 'accent' | 'neutral'` | — | Semantic color variant. |
| `label` | `string` | — | Accessible label surfaced via aria-label. |
| `isPulsing` | `boolean` | `false` | Enables a pulse animation; respects prefers-reduced-motion: reduce. |
| `tooltip` | `string` | — | Tooltip text shown on hover to explain the status meaning. |
| `icon` | `ReactNode` | — | Optional icon rendered centered inside the dot, painted in currentColor (the variant's ink). Gives the status a non-color mark, so use a different icon per status. Booleans and empty strings are ignored, so `cond && <Icon />` is safe. Same contract as AvatarStatusDot. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.
- **Do:** Always pair with a visible text label so status is not conveyed by color alone.
- **Do:** Provide a descriptive `label` prop for screen reader accessibility.
- **Do:** Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.
- **Do:** If you can't add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).
- **Don't:** Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.
- **Don't:** Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.

## Theming

- `astryx-statusdot` — varies by: variant

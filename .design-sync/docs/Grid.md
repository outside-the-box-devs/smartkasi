---
category: Layout
---

# Grid

A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.

**Import:** `import {Grid} from '@astryxdesign/core/Grid';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `number | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}` | — | Column configuration. Use a number for fixed columns (e.g. `columns={3}`). Use an object for responsive columns: `minWidth` sets the minimum column width in px, `repeat` controls track behavior (`"fill"` preserves empty tracks for consistent widths, `"fit"` collapses empty tracks so items stretch; defaults to `"fill"`), and `max` caps the maximum number of columns. |
| `width` | `SizeValue` | — | Container width. Numbers are treated as pixels, strings are used as-is. |
| `height` | `SizeValue` | — | Container height. Numbers are treated as pixels, strings are used as-is. |
| `maxWidth` | `SizeValue` | — | Maximum container width. Numbers are treated as pixels, strings are used as-is. |
| `minHeight` | `SizeValue` | — | Minimum container height. Numbers are treated as pixels, strings are used as-is. |
| `gap` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Spacing between all items. |
| `rowGap` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Row spacing; overrides `gap` for the row axis. |
| `columnGap` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Column spacing; overrides `gap` for the column axis. |
| `align` | `'start' | 'center' | 'end' | 'stretch'` | `'stretch'` | Vertical alignment of items. |
| `justify` | `'start' | 'center' | 'end' | 'stretch'` | `'stretch'` | Horizontal alignment of items. |
| `children` | `ReactNode` | — | Grid content. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Use responsive columns for layouts that should adapt to screen size: `columns={{minWidth: 280}}`.
- **Do:** Cap the column count with `max` to prevent rows from getting too wide on large screens.
- **Do:** Use `repeat: 'fill'` (the default) for consistent item widths. Use `'fit'` when items should stretch to fill leftover space.
- **Don't:** Write manual CSS grid; Grid handles spacing and responsive behavior for you.
- **Don't:** Use `HStack` with wrapping for grids; use Grid instead.
- **Do:** Track templates use CSS-variable indirection (not raw inline styles), so `xstyle` overrides of `gridTemplateColumns` (including inside `@media` queries) take effect.

## Theming

- `astryx-grid` — varies by: align, columns, gap, justify
- `astryx-grid-span`

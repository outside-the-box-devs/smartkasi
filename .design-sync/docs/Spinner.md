---
category: Feedback & Status
---

# Spinner

An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.

**Import:** `import {Spinner} from '@astryxdesign/core/Spinner';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Spinner size (10px, 14px, 18px). |
| `shade` | `'default' | 'onMedia' | 'subtle' | 'inherit'` | `'default'` | Color shade for light or dark backgrounds. |
| `label` | `ReactNode` | — | Visible content below the spinner. String labels auto-set aria-label. |
| `aria-label` | `string` | `'Loading'` | Accessible name for screen readers. Defaults to label (if string) or "Loading". |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Provide a meaningful label to describe what is loading for screen reader users.
- **Do:** Use the "onMedia" shade when placed on dark or accent-colored backgrounds.
- **Don't:** Use for content areas with known dimensions; use Skeleton to preserve layout instead.
- **Don't:** Stack multiple spinners in the same view; use one to represent the overall loading state.

## Theming

- `astryx-spinner` — varies by: size, shade

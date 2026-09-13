---
category: Layout
---

# Divider

A visual separator that divides content into distinct sections. Use to create clear boundaries between groups of related content, or to demarcate interactive regions within a layout.

**Import:** `import {Divider} from '@astryxdesign/core/Divider';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' | 'vertical'` | `'horizontal'` | Orientation of the divider. |
| `label` | `ReactNode` | — | Optional label centered on the divider. |
| `variant` | `'subtle' | 'strong'` | `'subtle'` | Visual weight of the divider line. |
| `isFullBleed` | `boolean` | `false` | Extend the divider to container edges with negative margins. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use subtle dividers between related content sections and strong dividers for high-contrast boundaries.
- **Do:** Add a label to the divider when sections need a visible category heading.
- **Don't:** Overuse dividers; rely on spacing and layout to separate content when possible.

## Theming

- `astryx-divider` — varies by: orientation, variant

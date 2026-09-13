---
category: Layout
---

# Section

Section is the correct way to create page regions and group related content on a page. Use it for settings groups, form sections, sidebar areas, or any time you need visual separation between parts of a page. If you are tempted to use a Card for a page section, use Section instead.

**Import:** `import {Section} from '@astryxdesign/core/Section';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'section' | 'transparent' | 'muted'` | `'section'` | Background variant applied to the section container. |
| `width` | `SizeValue` | — | Width of the section; a number is interpreted as pixels, a string is used as-is. |
| `height` | `SizeValue` | — | Height of the section; a number is interpreted as pixels, a string is used as-is. |
| `maxWidth` | `SizeValue` | — | Maximum width of the section. |
| `minHeight` | `SizeValue` | — | Minimum height of the section. |
| `children` | `ReactNode` | — | Content rendered inside the section. |
| `dividers` | `Array<'top' | 'bottom' | 'start' | 'end'>` | — | Which sides of the section have divider borders. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | `4` | Internal padding using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Use padding={0} for edge-to-edge content. |
| `paddingInline` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline (horizontal) padding override. Overrides only the inline-axis padding while preserving block padding from `padding` or the container theme default. Accepts the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). |
| `paddingInlineStart` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline-start padding override (left in LTR, right in RTL). Overrides paddingInline and padding on that edge only. |
| `paddingInlineEnd` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline-end padding override (right in LTR, left in RTL). Overrides paddingInline and padding on that edge only. |
| `paddingBlock` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block (vertical) padding override. Overrides only the block-axis padding while preserving inline padding from `padding` or the container theme default. Accepts the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). |
| `paddingBlockStart` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block-start (top) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only. |
| `paddingBlockEnd` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block-end (bottom) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object. |

## Best practices

- **Do:** Use Section for page-level grouping: settings panels, form groups, sidebar regions. These are sections of a page, not discrete items.
- **Do:** Start with the default variant. Use muted only to call attention to a specific region.
- **Do:** Add dividers between same-background sections that need separation.
- **Do:** Combine with a heading + Stack for a typical page section pattern.
- **Don't:** Use Card when you mean Section. Cards are for discrete items (one notification, one profile). Sections are for page regions.

## Theming

- `astryx-section` — varies by: variant

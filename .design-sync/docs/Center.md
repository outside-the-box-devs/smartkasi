---
category: Layout
---

# Center

Center aligns content to the middle of its container. Use it for empty states, loading screens, login forms, or any content that should sit in the center of the available space.

**Import:** `import {Center} from '@astryxdesign/core/Center';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Container | Yes | A flexbox wrapper that aligns its children to the center along the chosen axis. |
| Content | Yes | Any children passed to Center. Typically a card, form, spinner, or empty state message. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `axis` | `'both' | 'horizontal' | 'vertical'` | `'both'` | Which direction(s) to center. |
| `width` | `SizeValue` | — | Container width (px or CSS value). |
| `height` | `SizeValue` | — | Container height (px or CSS value). |
| `maxWidth` | `SizeValue` | — | Maximum container width (px or CSS value). |
| `minHeight` | `SizeValue` | — | Minimum container height (px or CSS value). |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inner padding on all sides, using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Matches the padding prop on Stack, Card, LayoutContent, and LayoutPanel. Pass as a JSX number expression e.g. padding={3}. |
| `paddingInline` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline (horizontal) padding, using the spacing scale. Overrides padding on the inline axis when both are set. |
| `paddingInlineStart` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline-start padding, using the spacing scale (left in LTR, right in RTL). Overrides paddingInline and padding on that edge only. |
| `paddingInlineEnd` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Inline-end padding, using the spacing scale (right in LTR, left in RTL). Overrides paddingInline and padding on that edge only. |
| `paddingBlock` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block (vertical) padding, using the spacing scale. Overrides padding on the block axis when both are set. |
| `paddingBlockStart` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block-start (top) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only. |
| `paddingBlockEnd` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Block-end (bottom) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only. |
| `isInline` | `boolean` | `false` | Use inline-flex (useful for text/icons). |
| `children` | `ReactNode` | — | Content to center. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use axis="horizontal" or axis="vertical" when you only need one direction. Both axes is the default but not always needed.
- **Do:** Set a height when centering vertically. Center needs a defined height to know what space to center within.
- **Do:** Use isInline to center small elements like icons or badges within a line of text without breaking the text flow.
- **Don't:** Wrap large page sections in Center. Use Layout or AppShell for page-level structure.
- **Don't:** Use Center for horizontal lists of items. Use Stack with hAlign="center" instead.

## Theming

- `astryx-center` — varies by: axis

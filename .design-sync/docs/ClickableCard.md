---
category: Container
---

# Clickable Card

An interactive card for navigation or action targets. Nested interactive elements work independently.

**Import:** `import {ClickableCard} from '@astryxdesign/core/ClickableCard';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Container | Yes | Interactive div with hover/focus/active states. |
| Content | Yes | Children, which may include nested interactive elements. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessibility label. |
| `onClick` | `(event: MouseEvent) => void` | — | Click handler: fires on card surface only. |
| `href` | `string` | — | Navigation URL. |
| `target` | `string` | `'_self'` | Link target. |
| `isDisabled` | `boolean` | `false` | Disables the card. |
| `children` | `ReactNode` | — | Card content. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | `4` | Inner padding. |
| `variant` | `'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'` | `'default'` | Background color variant. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth. Often raised to signal the whole card is clickable. |
| `width` | `SizeValue` | — | Card width. |
| `height` | `SizeValue` | — | Card height. |
| `maxWidth` | `SizeValue` | — | Maximum card width. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use for cards that navigate to a detail page or trigger a single action.
- **Do:** Nest buttons or links freely inside; they handle their own events.
- **Don't:** Use for toggling selection; use SelectableCard for that.

## Canonical defaults

```json
{
  "label": "View product details",
  "href": "#",
  "padding": 4,
  "children": {
    "__element": "XDSVStack",
    "props": {
      "gap": 1
    },
    "children": [
      {
        "__element": "XDSHeading",
        "props": {
          "level": 3
        },
        "children": "Wireless Headphones"
      },
      {
        "__element": "XDSText",
        "props": {
          "type": "body"
        },
        "children": "Noise-cancelling over-ear headphones with 30-hour battery life."
      }
    ]
  }
}
```

## Theming

- `astryx-clickable-card` — varies by: variant

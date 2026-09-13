---
category: Container
---

# Selectable Card

A card that toggles between selected and unselected states with an accent border. For navigation use ClickableCard.

**Import:** `import {SelectableCard} from '@astryxdesign/core/SelectableCard';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Container | Yes | Interactive div with accent border on selection. |
| Content | Yes | Children rendered inside the card. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessibility label. |
| `isSelected` | `boolean` | — | Controlled selection state. |
| `onChange` | `(isSelected: boolean) => void` | — | Called when toggled. |
| `isDisabled` | `boolean` | `false` | Disables the card. |
| `children` | `ReactNode` | — | Card content. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | `4` | Inner padding. |
| `variant` | `'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'` | `'default'` | Background color variant. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth. The selection ring composes on top, so a selected card keeps its shadow. |
| `width` | `SizeValue` | — | Card width. |
| `height` | `SizeValue` | — | Card height. |
| `maxWidth` | `SizeValue` | — | Maximum card width. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use for plan pickers, filter chips, or option grids.
- **Do:** For single-select track one ID; for multi-select use a Set.
- **Do:** When focused, toggle selection with Space or Enter.
- **Don't:** Use for navigation; use ClickableCard for that.

## Canonical defaults

```json
{
  "label": "Pro plan",
  "isSelected": true,
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
        "children": "Pro plan"
      },
      {
        "__element": "XDSText",
        "props": {
          "type": "body"
        },
        "children": "$29/month, unlimited projects and priority support."
      }
    ]
  }
}
```

## Theming

- `astryx-selectable-card` — varies by: selected, variant

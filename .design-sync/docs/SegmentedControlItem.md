---
category: Action
---

# Segmented Control Item

**Import:** `import {SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Unique value for this segment, matched against the parent value. |
| `label` | `string` | — | Accessible label for this segment. Rendered as visible text unless isLabelHidden is true. |
| `isLabelHidden` | `boolean` | `false` | Whether the label is visually hidden. When true, only the icon is displayed and label is used as aria-label. |
| `icon` | `ReactNode` | — | Icon element displayed before the label. |
| `isDisabled` | `boolean` | `false` | Whether this individual item is disabled. |

## Canonical defaults

```json
{
  "value": "item-1",
  "label": "Item"
}
```

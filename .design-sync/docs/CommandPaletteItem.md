---
category: Overlay
---

# Command Palette Item

**Import:** `import {CommandPaletteItem} from '@astryxdesign/core/CommandPalette';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Unique value for identification and selection. |
| `children` | `ReactNode` | — | Item content: render icons, descriptions, keyboard shortcuts, etc. |
| `onSelect` | `(value: string) => void` | — | Called when this item is selected via click or Enter. |
| `isHighlighted` | `boolean` | `false` | Whether this item has keyboard focus. Derived from context when inside CommandPalette. |
| `isSelected` | `boolean` | `false` | Whether this item is selected in picker mode. |
| `isDisabled` | `boolean` | `false` | Whether the item is non-interactive. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization. Must be a stylex.create() value. |

## Canonical defaults

```json
{
  "value": "go-home",
  "children": "Go to Dashboard"
}
```

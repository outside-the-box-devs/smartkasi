---
category: Overlay
---

# Command Palette List

**Import:** `import {CommandPaletteList} from '@astryxdesign/core/CommandPalette';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Items, groups, and empty states. |
| `label` | `string` | `'Commands'` | Accessible label for the listbox. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization. Must be a stylex.create() value. |

## Canonical defaults

```json
{
  "children": [
    {
      "__element": "CommandPaletteItem",
      "props": {
        "value": "home"
      },
      "children": "Go Home"
    },
    {
      "__element": "CommandPaletteItem",
      "props": {
        "value": "settings"
      },
      "children": "Open Settings"
    },
    {
      "__element": "CommandPaletteItem",
      "props": {
        "value": "profile"
      },
      "children": "View Profile"
    }
  ]
}
```

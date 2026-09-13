---
category: Overlay
---

# Command Palette Group

**Import:** `import {CommandPaletteGroup} from '@astryxdesign/core/CommandPalette';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | — | Group heading text. |
| `children` | `ReactNode` | — | CommandPaletteItem children. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization. Must be a stylex.create() value. |

## Canonical defaults

```json
{
  "heading": "Navigation",
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

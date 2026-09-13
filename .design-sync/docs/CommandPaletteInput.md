---
category: Overlay
---

# Command Palette Input

**Import:** `import {CommandPaletteInput} from '@astryxdesign/core/CommandPalette';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `'Search...'` | Placeholder text for the input. |
| `label` | `string` | — | Accessible label for the combobox input, announced by screen readers. Falls back to the placeholder text when omitted. |
| `hasAutoFocus` | `boolean` | `true` | Auto-focus the input when mounted. Automatically disabled when inside an inline command palette. |
| `endContent` | `ReactNode` | — | Content rendered at the trailing end of the input, after the spinner. Use for clear buttons or keyboard shortcut hints. |
| `value` | `string` | — | Search value. When omitted inside CommandPalette, reads from context. |
| `onValueChange` | `(value: string) => void` | — | Called when search value changes. When omitted inside CommandPalette, writes to context. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization. Must be a stylex.create() value. |

## Canonical defaults

```json
{
  "placeholder": "Search commands, files, or actions...",
  "hasAutoFocus": false
}
```

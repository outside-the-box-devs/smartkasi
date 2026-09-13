---
category: Navigation
---

# Tab

**Import:** `import {Tab} from '@astryxdesign/core/TabList';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Unique value for this tab, matched against TabListContext.value. |
| `label` | `string` | — | Accessible label for this tab. Used as visible text by default, or as aria-label when isLabelHidden is true. |
| `isLabelHidden` | `boolean` | `false` | Whether the label is visually hidden. When true, only the icon and endContent are displayed, and label is used as aria-label for accessibility. |
| `href` | `string` | — | URL to navigate to; when provided, the tab renders as an anchor element. |
| `as` | `LinkComponentType` | — | Custom component to render instead of <a> for link tabs. Overrides the LinkProvider default. Only applies when href is provided. |
| `icon` | `ReactNode` | — | Icon element shown when the tab is not selected. |
| `selectedIcon` | `ReactNode` | — | Icon element shown when the tab is selected; falls back to icon if not provided. |
| `endContent` | `ReactNode` | — | Content rendered after the label, such as a badge count or status dot. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Canonical defaults

```json
{
  "value": "tab-1",
  "label": "Tab"
}
```

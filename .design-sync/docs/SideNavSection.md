---
category: Navigation
---

# Side Nav Section

**Import:** `import {SideNavSection} from '@astryxdesign/core/SideNav';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Section title. |
| `subtitle` | `string` | — | Section subtitle. |
| `children` | `ReactNode` | — | Section items. |
| `endContent` | `ReactNode` | — | Right-side content in the section header. |
| `isHeaderHidden` | `boolean` | `false` | Visually hides the section header while keeping it accessible to screen readers. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

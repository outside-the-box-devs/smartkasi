---
category: Table & List
---

# List Item

**Import:** `import {ListItem} from '@astryxdesign/core/List';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Primary text. |
| `description` | `ReactNode` | — | Secondary content below the label. A plain string gets single-line truncation automatically; a ReactNode lets child components control their own wrapping and line-clamp behavior. |
| `startContent` | `ReactNode` | — | Content rendered before the label area (e.g. icon, avatar). |
| `endContent` | `ReactNode` | — | Content rendered after the label area (e.g. badge, chevron). |
| `onClick` | `(e: MouseEvent) => void` | — | Click handler; enables the invisible button pattern. |
| `interactiveRef` | `RefObject<HTMLElement | null>` | — | Ref to a nested control (e.g. a checkbox in startContent) that owns the item's keyboard access and action. The row becomes an enlarged click/tap target that delegates surface clicks to it (useClickableContainer) and renders no invisible button/anchor, so the row adds no second tab stop (WCAG 4.1.2). Mutually exclusive with onClick/href; those are ignored when set. |
| `href` | `string` | — | Link URL; enables the invisible anchor pattern. |
| `target` | `string` | — | Link target attribute, only applicable when href is provided. target="_blank" automatically adds noopener noreferrer. |
| `rel` | `string` | — | Link relationship tokens. noopener noreferrer are merged automatically for target="_blank". |
| `isDisabled` | `boolean` | `false` | Disabled state; sets aria-disabled on the item. |
| `isSelected` | `boolean` | `false` | Selected state; sets aria-selected on the item. |

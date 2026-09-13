---
category: Navigation
---

# Side Nav Item

**Import:** `import {SideNavItem} from '@astryxdesign/core/SideNav';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Item label. |
| `as` | `LinkComponentType` | — | Custom link component. |
| `icon` | `IconType` | — | Icon displayed in the outline (unselected) variant. See `astryx docs icons` for valid semantic names. |
| `selectedIcon` | `IconType` | — | Icon displayed when the item is selected (filled variant). See `astryx docs icons` for valid semantic names. |
| `isSelected` | `boolean` | `false` | Marks this item as the current page. |
| `isDisabled` | `boolean` | `false` | Disabled state. |
| `href` | `string` | — | Navigation URL. |
| `onClick` | `(e: MouseEvent) => void` | — | Click handler. |
| `endContent` | `ReactNode` | — | Right-side content such as badges or counts. |
| `children` | `ReactNode` | — | Sub-items for nesting. |
| `collapsible` | `boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }` | `false` | Enables collapse behavior for items with children. Pass true for uncontrolled (starts expanded), or an object for controlled mode. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant for the nav item row. |

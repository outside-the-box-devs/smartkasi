---
category: Navigation
---

# Side Nav

A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.

**Import:** `import {SideNav} from '@astryxdesign/core/SideNav';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Product icon and name | No | Branding area at the top of the nav. |
| Navigation items | Yes | Sections and groups of navigable links. |
| Collapse/expand toggle | No | Toggle to collapse or expand the side nav. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `header` | `ReactNode` | — | Header area (typically SideNavHeading). Sticky. |
| `topContent` | `ReactNode` | — | Content below the header, e.g., a create button. |
| `children` | `ReactNode` | — | Navigation sections and items. Scrollable. |
| `footer` | `ReactNode` | — | Footer area above the icon bar. |
| `footerIcons` | `ReactNode` | — | Footer icon bar. The row cascades a 'sm' size to the interactive children it contains, so its icons and the built-in collapse button come out one height; pass an explicit size on a child to opt out. |
| `collapsible` | `boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }` | `false` | Enables collapse behavior. true for uncontrolled with default toggle button, or an object for controlled mode and advanced config (defaultIsCollapsed, isCollapsed + onCollapsedChange, hasButton, buttonLabel). A controlled config can also be passed to a SideNavCollapseButton rendered outside this SideNav, so both share one state. |
| `resizable` | `boolean | { defaultWidth?: number; minWidth?: number; maxWidth?: number; autoSaveId?: string; onWidthChange?: (width: number) => void }` | `false` | Enables a resize handle at the inline-end edge. true for defaults (260px initial, 180-480px range), or a ResizableConfig object (defaultWidth, minWidth, maxWidth, autoSaveId for localStorage persistence, onWidthChange). The handle is hidden while collapsed. |
| `handleRef` | `Ref<SideNavImperativeCollapseHandle>` | — | Deprecated. Imperative collapse handle for SideNavCollapseButton instances rendered outside this SideNav; hand both the same controlled collapsible config instead. Separate from `ref`, which continues to expose the root HTMLElement. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Use sections to group related navigation items and help users scan for their destination.
- **Do:** Pair outline and filled icon variants so the selected state is visually distinct.
- **Do:** Mark the current page with isSelected — it sets aria-current="page", so the current destination is announced rather than carried by color alone.
- **Do:** SideNav renders a navigation landmark, and a collapsible item follows the WAI-ARIA APG Disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): the toggle carries aria-expanded and aria-controls, and the group it owns is inert while collapsed. Keep item labels short — they are the accessible name in both expanded and icon-only modes.
- **Do:** While the nav is collapsed, an item with children shows them in a submenu flyout. On a device that can hover, pointing at the item opens it after a short delay and moving away closes it; a flyout opened by clicking stays open until it is dismissed. On touch, it opens on tap. Do not put an action in there that has no other route to it.
- **Don't:** Include a SideNavHeading when a TopNav is already providing app identity; this duplicates branding.
- **Don't:** Use for filtering content; use tabs or filter buttons instead.

## Canonical defaults

```json
{
  "children": [
    {
      "__element": "SideNavItem",
      "props": {
        "label": "Dashboard",
        "isSelected": true
      }
    },
    {
      "__element": "SideNavItem",
      "props": {
        "label": "Projects"
      }
    },
    {
      "__element": "SideNavItem",
      "props": {
        "label": "Settings"
      }
    }
  ]
}
```

## Theming

- `astryx-side-nav` — varies by: mode
- `astryx-side-nav-heading`
- `astryx-side-nav-item` — varies by: size
- `astryx-side-nav-section`

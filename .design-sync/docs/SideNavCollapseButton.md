---
category: Navigation
---

# Side Nav Collapse Button

**Import:** `import {SideNavCollapseButton} from '@astryxdesign/core/SideNav';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `collapsible` | `{isCollapsed: boolean, onCollapsedChange: (isCollapsed: boolean) => void}` | — | The same controlled collapsible config passed to SideNav. Only needed when the button is rendered outside the sidenav, where collapse context cannot reach it. |
| `handleRef` | `RefObject<SideNavImperativeCollapseHandle | null>` | — | Deprecated. Imperative collapse handle from SideNav; pass collapsible instead. |
| `label` | `string` | — | Custom button label. When provided, renders as a text button with chevron. When omitted, renders icon-only. |
| `size` | `'sm' | 'md' | 'lg'` | — | Button size. Defaults to the size its container cascades ('sm' inside a SideNav footer) and to 'md' with no container. Set it when the button sits outside a sized container and has to match its neighbours. |
| `children` | `ReactNode` | — | Custom button content. Overrides the default chevron icon and label. |

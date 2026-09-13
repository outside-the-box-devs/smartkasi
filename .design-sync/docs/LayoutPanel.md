---
category: Layout
---

# Layout Panel

**Import:** `import {LayoutPanel} from '@astryxdesign/core/Layout';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Panel content. |
| `hasDivider` | `boolean` | `false` | Border on the appropriate edge. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Internal padding using the spacing scale. Overrides the default padding from the layout container. |
| `isScrollable` | `boolean` | `true` | Enable scrollable overflow. |
| `label` | `string` | — | Accessible label for the landmark element. |
| `role` | `AriaRole` | — | ARIA landmark role. |
| `width` | `number | string` | — | Width of the panel. Numbers are treated as pixels, strings are used as-is. Ignored when resizable is provided; the hook controls width. |
| `resizable` | `ResizableProps` | — | Resize props from useResizable(). When provided, the hook drives the panel width and a ResizeHandle should be placed adjacent to the panel. |

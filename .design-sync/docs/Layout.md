---
category: Layout
---

# Layout

Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use Layout for full app layouts and HStack/VStack for simple directional stacking.

**Import:** `import {Layout} from '@astryxdesign/core/Layout';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | — | Main content area (center). Children passed to `<Layout>` render here too: `<Layout>{main}</Layout>` is shorthand for `<Layout content={main} />`. |
| `header` | `ReactNode` | — | Header slot. |
| `footer` | `ReactNode` | — | Footer slot. |
| `start` | `ReactNode` | — | Start panel (left in LTR). |
| `end` | `ReactNode` | — | End panel (right in LTR). |
| `height` | `'fill' | 'auto'` | `'fill'` | Height behavior: fill the container or grow with content. |
| `contentWidth` | `number | string` | — | Maximum width of the content within each slot (header, content, footer, panels), centered when narrower than the available space. Dividers stay full-bleed. Numbers are pixels, strings are used as-is (e.g. `60ch`). Common page widths: 640 for forms, settings, and text-focused pages; 960 for content pages and wider layouts. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | — | Padding at the layout's outer edges using the spacing scale. |
| `defaultHasDividers` | `boolean` | — | Default divider visibility for LayoutHeader and LayoutFooter children. Headers and footers that don't pass `hasDivider` use this value; when unset, nested layouts inherit from their parent context. |

## Best practices

- **Do:** Use Layout for page shells that need distinct zones like header, sidebar(s), content, and footer.
- **Do:** Use HStack and VStack for simple directional stacking within a content area.
- **Don't:** Use Layout for simple stacking layouts; use HStack or VStack instead.
- **Don't:** Nest multiple Layout components; use one per page shell and compose content within its slots.

## Canonical defaults

```json
{
  "header": {
    "__element": "LayoutHeader",
    "props": {},
    "children": {
      "__element": "Heading",
      "props": {
        "level": 3
      },
      "children": "Page Title"
    }
  },
  "content": {
    "__element": "LayoutContent",
    "props": {},
    "children": {
      "__element": "Text",
      "props": {
        "type": "body",
        "color": "secondary"
      },
      "children": "Main content area. This is the scrollable center section of the layout."
    }
  },
  "footer": {
    "__element": "LayoutFooter",
    "props": {},
    "children": {
      "__element": "Text",
      "props": {
        "type": "supporting",
        "color": "secondary"
      },
      "children": "Footer: status bar or actions"
    }
  }
}
```

## Theming

- `astryx-layout` — varies by: height
- `astryx-layout-content`
- `astryx-layout-footer`
- `astryx-layout-header`
- `astryx-layout-panel`

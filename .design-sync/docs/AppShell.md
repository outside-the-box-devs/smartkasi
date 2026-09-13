---
category: Layout
---

# App Shell

The outermost layout for an application. Provides slots for top navigation, side navigation, banners, and main content. Use it as the root wrapper for every page. It handles responsive mobile navigation and skip-to-content automatically. Configure side nav collapse on SideNav with its collapsible prop.

**Import:** `import {AppShell} from '@astryxdesign/core/AppShell';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Skip link | Yes | First focusable element on the page. Visually hidden until focused, then moves focus to the main content area. |
| Banner | No | The banner slot, for system-wide announcements. Renders above the top nav, inside the banner landmark. |
| Top navigation | No | The topNav slot, typically TopNav. Below the mobile breakpoint it becomes a compact bar carrying the nav toggle. |
| Side navigation | No | The sideNav slot, typically SideNav. Inline above the breakpoint, moved into the mobile drawer below it. |
| Main content | Yes | children, rendered in the main landmark. Scrolls internally when height is fill, and with the page when it is auto. |
| Mobile nav drawer | No | Generated below the breakpoint from the nav slots unless mobileNav disables or replaces it. A modal dialog: it traps focus and returns focus to the toggle on close. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Main content area, rendered inside a <main> element. |
| `contentPadding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | `0` | Padding for the main content area. Set based on the dominant content pattern: 4 (16px) for forms/settings/text, 0 for dashboards/maps/tables. Override individual sections with Section. |
| `topNav` | `ReactNode` | — | Top navigation slot, typically TopNav. |
| `sideNav` | `ReactNode` | — | Side navigation slot, typically SideNav. |
| `mobileNav` | `ReactNode` | — | Mobile navigation configuration. Accepts false (disable), a config object (tune auto behavior), or ReactNode (full custom drawer). The config object is {hasToggle?: boolean, isOpen?: boolean, onOpenChange?: (isOpen: boolean) => void, content?: ReactNode, breakpoint?: 'sm' | 'md' | 'lg' | 'none', defaultIsMobile?: boolean}; breakpoint defaults to 'md'. |
| `banner` | `ReactNode` | — | Banner slot for system-wide announcements, placed above the topNav. |
| `height` | `'fill' | 'auto'` | `'fill'` | Height behavior: 'fill' makes the shell fill the viewport (100dvh) with independent scroll containers; 'auto' lets the shell grow with content and uses sticky positioning for nav. |
| `variant` | `'wash' | 'surface' | 'section' | 'elevated'` | `'elevated'` | Navigation background style controlling how nav areas contrast with content. 'wash' uses wash background, 'surface' uses surface background, 'section' adds dividers between nav and content, 'elevated' uses wash nav with elevated surface content and border radius. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Choose the right height: use "fill" for dashboards with internal scrolling and "auto" for pages that grow with content.
- **Do:** Set `contentPadding` based on content type: 4 for forms and settings, 0 for tables and dashboards.
- **Do:** Give every nav slot an accessible name. AppShell renders TopNav and SideNav as separate navigation landmarks, and a screen reader lists them by name, so pass `label` to each one.
- **Do:** Start the page heading inside `children`. AppShell owns the skip link, the banner landmark and the main landmark, but it renders no heading, so the first heading in the content area is the page h1.
- **Don't:** Nest one AppShell inside another; it's the outermost layout frame.
- **Don't:** Use for sub-page layouts; use Layout for content areas within AppShell.
- **Don't:** Add your own skip link or <main> element. AppShell already renders both, and a second main landmark makes the first ambiguous.

## Canonical defaults

```json
{
  "variant": "surface",
  "contentPadding": 4,
  "topNav": {
    "__element": "TopNav",
    "props": {
      "label": "Navigation",
      "heading": {
        "__element": "TopNavHeading",
        "props": {
          "heading": "My App"
        }
      }
    }
  },
  "sideNav": {
    "__element": "SideNav",
    "props": {},
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
          "label": "Settings"
        }
      },
      {
        "__element": "SideNavItem",
        "props": {
          "label": "Help"
        }
      }
    ]
  },
  "children": {
    "__element": "VStack",
    "props": {
      "gap": 3
    },
    "children": [
      {
        "__element": "Heading",
        "props": {
          "level": 2
        },
        "children": "Dashboard"
      },
      {
        "__element": "Text",
        "props": {
          "type": "body",
          "color": "secondary"
        },
        "children": "Welcome back. Here is an overview of your workspace."
      }
    ]
  }
}
```

## Theming

- `astryx-app-shell` — varies by: variant
- `astryx-app-shell-header` — varies by: variant
- `astryx-app-shell-sidenav` — varies by: variant

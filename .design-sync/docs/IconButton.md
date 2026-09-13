---
category: Action
---

# Icon Button

A button that shows only an icon with no visible text. Use IconButton in toolbars, table rows, and compact UI where space is tight and the icon is universally understood.

**Import:** `import {IconButton} from '@astryxdesign/core/IconButton';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible label. Used as aria-label (not rendered as visible text). |
| `icon` | `ReactNode` | — | Icon element rendered inside the button. |
| `variant` | `'primary' | 'secondary' | 'ghost' | 'destructive'` | `'secondary'` | Visual style variant. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth. The most common FAB shape is an icon-only button, so raise it with `low`/`med`/`high` for a floating action button. `none` is the default flat button. |
| `isLoading` | `boolean` | `false` | Shows a loading spinner and disables interaction. |
| `isDisabled` | `boolean` | `false` | Disables the button. |
| `tooltip` | `string` | — | Tooltip text shown on hover. |
| `onClick` | `(e: MouseEvent) => void` | — | Standard click handler. |
| `clickAction` | `(e: MouseEvent) => void | Promise<void>` | — | Async click handler with automatic loading state. |

## Best practices

- **Do:** Make the aria-label specific: a trash icon labeled "Delete conversation" is clearer than just "Delete" for screen readers.
- **Do:** Add a tooltip: even a gear icon can mean Settings, Preferences, or Configure.
- **Do:** Use ghost in toolbars and dense areas to reduce visual clutter.
- **Don't:** Use IconButton if the action isn't obvious from the icon alone; use Button with text.
- **Don't:** Skip the tooltip; label only reaches screen readers, sighted users need the hover hint.

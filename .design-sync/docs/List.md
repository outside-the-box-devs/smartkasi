---
category: Table & List
---

# List

A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.

**Import:** `import {List} from '@astryxdesign/core/List';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| List title | Yes | Heading that labels the list. |
| Description | No | Supplementary text below the title. |
| List items | Yes | Individual entries, which may include icons or images. |
| Item description | No | Additional detail for an individual list item. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | List items (ListItem components). |
| `density` | `'compact' | 'balanced' | 'spacious'` | `'balanced'` | Spacing density for items. |
| `hasDividers` | `boolean` | `false` | Show dividers between items. |
| `header` | `ReactNode` | — | Header content, associated with the list via aria-labelledby. |
| `listStyle` | `'none' | 'disc' | 'decimal' | 'circle'` | `'none'` | List marker style. 'decimal' renders an <ol> element instead of <ul>. |
| `start` | `number` | `1` | Starting number for ordered lists (listStyle='decimal'). Sets the CSS counter to begin at this value. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Provide a header to label the list and give context to screen readers.
- **Do:** Use start and end content slots to add icons, avatars, or badges to each item.
- **Don't:** Place interactive elements inside an interactive list item; it creates nested click targets and confusing focus behavior.
- **Don't:** Use a list for a single item or for laying out unrelated content; lists imply a meaningful collection.
- **Don't:** Mix clickable and non-clickable items in the same list without clear visual distinction.

## Theming

- `astryx-list` — varies by: density, listStyle
- `astryx-list-item`

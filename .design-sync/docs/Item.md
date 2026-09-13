---
category: Table & List
---

# Item

A single, flexible item primitive that unifies the "start content + label + description + end content" pattern across Astryx. Use it wherever you need a structured row: dropdown menus, selectors, contact lists, notifications, file browsers, and activity feeds.

**Import:** `import {Item} from '@astryxdesign/core/Item';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Marker | No | Optional list bullet/counter rendered before start content. |
| Start content | No | Leading visual: avatar, icon, image, or checkbox. |
| Label | Yes | Primary text identifying the item. |
| Description | No | Secondary supporting text below the label. |
| End content | No | End-aligned content: badges, timestamps, or action buttons. |

## Best practices

- **Do:** Use named slots (startContent, label, description, endContent) for the common layout. These cover the 80% case.
- **Do:** Use density="compact" for menus and dense lists, "balanced" for standard rows, and "spacious" for roomier layouts.
- **Do:** Set labelLines and descriptionLines to control truncation when content length varies.
- **Do:** Use align="start" when start or end content is taller than a single line of text.
- **Don't:** Don't nest interactive elements (buttons, links) inside an interactive Item; it creates confusing focus and click targets.
- **Don't:** Don't use Item for navigation between views; use proper navigation components instead.
- **Don't:** Don't add read/unread or inbox-specific behavior directly; compose a thin wrapper like PreviewItem instead.

## Canonical defaults

```json
{
  "label": "Item label",
  "description": "Supporting text"
}
```

## Theming

- `astryx-item` — varies by: density, align

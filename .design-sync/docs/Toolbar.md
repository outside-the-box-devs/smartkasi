---
category: Action
---

# Toolbar

Toolbar is a horizontal bar with left, center, and right areas. Use it for contextual actions within a content area (above a table, inside a card, or in a panel), not as a page-level header. Set the size once on the toolbar and all buttons, inputs, and tabs inside it match automatically.

**Import:** `import {Toolbar} from '@astryxdesign/core/Toolbar';`

## Best practices

- **Do:** Put secondary actions like "Back" on the left, and primary actions like "Save" on the right.
- **Do:** Make temporary toolbars like bulk selection visually distinct so users can tell they're contextual, for example with a background color or border.
- **Do:** Visually separate the toolbar from the content below it, with a divider, a background variant, or both.
- **Do:** Use Toolbar as a card header when the header has interactive actions like filter or add; it gives you slot layout, keyboard navigation, and size cascading. If the header is just a title with no actions, a LayoutHeader or Section is enough.
- **Don't:** Put too many actions in one toolbar; move less common items into a MoreMenu.
- **Don't:** Set size on individual child buttons; set it once on the toolbar and it cascades automatically.
- **Don't:** Use Toolbar for app-wide navigation like main menu links or sign out; use TopNav or LayoutHeader for that.

## Canonical defaults

```json
{
  "label": "Table actions",
  "size": "sm",
  "dividers": [
    "bottom"
  ],
  "startContent": {
    "__element": "TabList",
    "props": {
      "value": "overview"
    },
    "children": [
      {
        "__element": "Tab",
        "props": {
          "label": "Overview",
          "value": "overview"
        }
      },
      {
        "__element": "Tab",
        "props": {
          "label": "Activity",
          "value": "activity"
        }
      }
    ]
  },
  "endContent": [
    {
      "__element": "Selector",
      "props": {
        "label": "Status",
        "isLabelHidden": true,
        "placeholder": "Status",
        "size": "sm",
        "options": [
          "Open",
          "In progress",
          "Done"
        ]
      }
    },
    {
      "__element": "Button",
      "props": {
        "label": "New item",
        "variant": "primary",
        "size": "sm"
      }
    }
  ]
}
```

## Theming

- `astryx-toolbar`

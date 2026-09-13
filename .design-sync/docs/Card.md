---
category: Container
---

# Card

Card is a bordered, elevated container for discrete, self-contained items: things you could reorder, remove, or interact with independently. Cards are NOT the default layout tool. Most content groups don't need a container at all; spacing and alignment create visual grouping naturally. Only reach for a Card when items need clear interaction boundaries or visual comparison in a grid.

**Import:** `import {Card} from '@astryxdesign/core/Card';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Container | Yes | The outer box with border, background, border-radius, and padding. |
| Content | Yes | Any children rendered inside the card. Often a stack of heading, text, and actions. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `SizeValue` | — | Width of the card (number = pixels, string = used as-is). |
| `height` | `SizeValue` | — | Height of the card (number = pixels, string = used as-is). |
| `maxWidth` | `SizeValue` | — | Maximum width of the card. |
| `minHeight` | `SizeValue` | — | Minimum height of the card. |
| `children` | `ReactNode` | — | Content to render inside the card. |
| `padding` | `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` | `4` | Internal padding using the spacing scale. |
| `variant` | `'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'` | `'default'` | Background color variant. `default` uses the standard card background. `transparent` drops the background entirely. `muted` uses the muted background for de-emphasised cards. The non-semantic variants use the corresponding `--color-background-<name>` token. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth. `none` is flat; `low`/`med`/`high` map to the shadow token scale. Raise a card only when it needs to float above surrounding content. |

## Best practices

- **Do:** Ask "could I reorder or remove this independently?" If yes, it's a card. If no, it's just a section of the page: use a heading + Stack or Section.
- **Do:** Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card represents one "thing" with clear interaction boundaries.
- **Do:** Spacing and alignment alone create visual grouping. Not everything needs a container; try removing the card and see if the grouping is still clear from whitespace and typography.
- **Do:** Keep padding consistent across sibling cards so they align visually in a grid or list.
- **Do:** Pair a card with Layout when you need a structured header, scrollable content, and footer with actions.
- **Don't:** Default to cards for visual grouping. A heading + Stack with proper spacing creates hierarchy without adding borders everywhere. Cards should be the exception, not the default.
- **Don't:** Wrap page sections in cards. "General Settings", "Notification Preferences", form groups: these are page regions, use Section or heading + stack.
- **Don't:** Create identical card grids (icon + heading + text, repeated). Vary the layout or question whether cards are needed at all.
- **Don't:** Nest cards inside other cards; flatten the hierarchy or use spacing and dividers instead.
- **Don't:** Use color variants for status; use Banner or Badge for that. Color cards are for categorization.

## Canonical defaults

```json
{
  "padding": 4,
  "children": {
    "__element": "VStack",
    "props": {
      "gap": 2
    },
    "children": [
      {
        "__element": "Heading",
        "props": {
          "level": 3
        },
        "children": "Card Title"
      },
      {
        "__element": "Text",
        "props": {
          "type": "body"
        },
        "children": "Card content goes here. This is a standard card with a heading and body text."
      }
    ]
  }
}
```

## Theming

- `astryx-card` — varies by: variant

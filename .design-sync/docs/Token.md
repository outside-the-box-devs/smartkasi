---
category: Content
---

# Token

Token is a small, inline element for representing discrete pieces of associated data, like tags, categories, or selections. Use it to label content, show active filters, or represent removable items like selected recipients in a compose field.

**Import:** `import {Token} from '@astryxdesign/core/Token';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Icon | No | A leading icon that identifies the token type, like a user avatar or category symbol. |
| Label | Yes | The visible text. Also used as the accessible name when isLabelHidden is true. |
| End content | No | Trailing content after the label, like a count badge or status dot. |
| Remove button | No | An X button that appears when onRemove is provided, letting users dismiss the token. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Text label displayed inside the token. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | The size of the token. |
| `color` | `'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'` | `'default'` | Color variant of the token. |
| `icon` | `ReactNode` | — | Optional icon rendered before the label. |
| `isDisabled` | `boolean` | `false` | Whether the token is disabled; reduces opacity and blocks interactions. |
| `onRemove` | `(e: React.MouseEvent) => void` | — | Callback fired when the remove button is clicked. When provided, an X button is rendered inside the token. |
| `onClick` | `(e: React.MouseEvent) => void` | — | Click handler. When provided, the token renders as a <span> container with an invisible <button> inside for accessibility. |
| `href` | `string` | — | Link URL. When provided, the token renders as an <a> element. |
| `description` | `string` | — | Accessible description applied via aria-description on the root element. |
| `endContent` | `ReactNode` | — | Content rendered after the label and before the remove button. |
| `isLabelHidden` | `boolean` | `false` | Visually hides the label using a screen-reader-only clip technique; the label remains accessible. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Use color to distinguish categories (for example, green for "Active", red for "Blocked", blue for "In Review") so users can scan status at a glance.
- **Do:** Provide an onRemove callback when tokens represent user selections that can be undone, like filters or multi-select values.
- **Do:** Add a leading icon when it helps identify the token type faster, like a person icon for user tokens or a tag icon for labels.
- **Do:** Keep labels short: one to three words. Tokens truncate with ellipsis when the text overflows.
- **Don't:** Don't use tokens for primary actions or navigation; use Button or Link instead. Tokens are for displaying metadata, not triggering workflows.
- **Don't:** Don't hide the label unless the icon alone is universally understood. A color dot without text is ambiguous.
- **Don't:** Don't mix too many colors in one token group. Stick to two or three meaningful colors so the palette stays scannable.

## Theming

- `astryx-token` — varies by: color, size

---
category: Action
---

# Button

Button triggers an action when clicked. Use it for form submissions, confirmations, navigation, or any interaction that needs a clear call to action.

**Import:** `import {Button} from '@astryxdesign/core/Button';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Icon | No | A leading icon that reinforces the label, like a trash icon on a Delete button. |
| Label | Yes | The visible text describing the action. Also used as the accessible name. |
| End content | No | A trailing badge or icon after the label, like a notification count or dropdown arrow. |
| Spinner | No | Replaces the icon during loading to show the action is in progress. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible label. Rendered as visible text by default; used as aria-label when isIconOnly is true. |
| `variant` | `'primary' | 'secondary' | 'ghost' | 'destructive'` | `'secondary'` | Visual style variant. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth for floating buttons (e.g. a FAB). `none` is the default flat button; `low`/`med`/`high` map to the shadow token scale. Ignored inside a ButtonGroup, where elevation is owned by the group. |
| `type` | `'button' | 'submit' | 'reset'` | `'button'` | HTML button type attribute. |
| `name` | `string` | — | HTML name attribute for form submission. |
| `value` | `string | number | readonly string[]` | — | HTML value attribute for form submission. |
| `form` | `string` | — | Associates the button with a form element by ID. |
| `isLoading` | `boolean` | `false` | Shows a loading spinner and disables interaction. Announces "Loading" via a live region. |
| `isInterruptible` | `boolean` | `false` | Keep the button clickable while a clickAction is pending: the spinner and aria-busy still show, but the button is not disabled and the action is not deduped, so a re-click lands and interrupts the in-flight action with a fresh one. |
| `isDisabled` | `boolean` | `false` | Disables the button. When a tooltip is present, uses aria-disabled instead of native disabled so the button stays focusable. |
| `icon` | `ReactNode` | — | Icon element rendered before the label text. |
| `isIconOnly` | `boolean` | `false` | When true, renders as a square icon-only button with label as aria-label. Requires icon. Tip: for a dedicated icon-only button component, use IconButton from '@astryxdesign/core/IconButton' instead. |
| `width` | `SizeValue` | — | Width of the button. Numbers are treated as pixels, strings are used as-is (e.g., '100%' for a full-width button). By default the button sizes to its content. |
| `children` | `ReactNode` | — | Optional override for visible text. When provided, displayed instead of label, but label is still required (it provides the accessible name). For most cases, just use label alone: <Button label="Save" />. |
| `endContent` | `ReactElement<IconProps> | ReactElement<BadgeProps>` | — | Trailing icon or badge rendered after the label. Ignored when isIconOnly is true. Color is inherited from the button variant. |
| `tooltip` | `string` | — | Tooltip text shown on hover. |
| `onClick` | `(e: MouseEvent) => void` | — | Standard click handler (passed through from ButtonHTMLAttributes). |
| `clickAction` | `(e: MouseEvent) => void | Promise<void>` | — | Async click handler. Shows loading state while the returned promise is pending. |

## Best practices

- **Do:** Reserve primary for the single most important action in the view. Use secondary or ghost for everything else based on emphasis.
- **Do:** Write labels that describe the action ("Save changes", "Delete account", "Send invite"), not vague labels like "OK" or "Click here".
- **Do:** Show a loading state for actions that take time, like saving or submitting, so the user knows it is working.
- **Do:** Always provide a label for icon-only buttons so screen readers can announce what the button does. Add a tooltip for sighted users.
- **Do:** For a dedicated icon-only button, use IconButton from '@astryxdesign/core/IconButton'. It is a separate component, not exported from '@astryxdesign/core/Button'.
- **Don't:** Place more than one primary button in the same view; this dilutes the visual hierarchy.
- **Don't:** Use the destructive variant without a confirmation step for irreversible actions like deleting data.
- **Don't:** Use a button for navigation. If it only takes the user to another page, use a link instead. Buttons are for actions like saving, deleting, or submitting.

## Canonical defaults

```json
{
  "label": "Click me",
  "variant": "primary"
}
```

## Theming

- `astryx-button` — varies by: size, variant

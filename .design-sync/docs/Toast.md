---
category: Overlay
---

# Toast

Toast shows a brief, non-blocking notification to confirm an action or present temporary information. Use it for scenarios where the user needs feedback but not a decision, such as saving, deleting, or changing a status.

For production use, prefer the `useToast()` hook; it handles positioning, stacking, auto-dismiss, and deduplication via `ToastViewport`. The `Toast` component renders the visual toast element inline and is useful for previews, documentation, and static showcases where the viewport lifecycle is not needed.

**Import:** `import {Toast} from '@astryxdesign/core/Toast';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Body | Yes | The primary message text describing what happened or what the user should know. |
| End content | No | A trailing action like an Undo button or a link, placed after the body text. |
| Dismiss button | Yes | A close button that lets the user manually dismiss the toast before auto-hide. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `body` | `ReactNode` | — | Primary message content. |
| `type` | `'info' | 'error'` | `'info'` | Toast type controlling background color. Error toasts persist until dismissed. |
| `isAutoHide` | `boolean` | — | Whether the toast auto-dismisses. Defaults to true for info, false for error. |
| `autoHideDuration` | `number` | `5000` | Duration in ms before auto-dismiss. |
| `endContent` | `ReactNode` | — | Content rendered at the trailing end (e.g. Undo button, link). |
| `uniqueID` | `string` | — | Unique identifier for deduplication. |
| `collisionBehavior` | `'overwrite' | 'ignore'` | `'overwrite'` | Behavior when a toast with matching uniqueID already exists. |
| `onHide` | `(reason: "auto" | "manual") => void` | — | Callback fired when the toast is removed. |

## Best practices

- **Do:** Keep messages short: only a few words that tell the user what happened, like "Changes saved" or "Message sent".
- **Do:** Add an undo action in the endContent slot for reversible operations like deleting an item, so the user can recover without navigating away.
- **Do:** Use uniqueID to deduplicate toasts that fire from repeated actions, like clicking a save button multiple times.
- **Do:** Use error type for failures that need attention but not immediate action; it persists until dismissed so the user won't miss it.
- **Don't:** Don't use a toast for critical errors that block the user. Use Banner for persistent, in-context messaging that requires acknowledgment.
- **Don't:** Don't put long or multi-line content in a toast; it disappears after 5 seconds and the user may not finish reading.
- **Don't:** Don't show form validation errors as toasts. Use inline field validation so the user can see exactly which field needs fixing.

## Theming

- `astryx-toast` — varies by: type

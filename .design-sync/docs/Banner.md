---
category: Feedback & Status
---

# Banner

Banner shows a persistent message at the top of a page or section. Use it for form errors, system updates, maintenance notices, or success confirmations that the user needs to see until they act on it.

**Import:** `import {Banner} from '@astryxdesign/core/Banner';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Icon | Yes | Automatically set based on the status (info, warning, error, success). |
| Title | Yes | The main message. Always required. |
| Description | No | Additional detail below the title. |
| Action button | No | A button for the user to act on the message, like "Review" or "Retry". |
| Dismiss button | No | Lets the user close the banner. Enabled by setting isDismissable. |
| Collapsible content | No | Extra detail that expands below the banner header, like a list of errors. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `'info' | 'warning' | 'error' | 'success'` | — | Status type controlling icon and color. |
| `title` | `ReactNode` | — | Title text or ReactNode displayed in the header. |
| `description` | `ReactNode` | — | Description text rendered below the title in the header. |
| `icon` | `ReactNode` | — | Override the default status icon. |
| `isDismissable` | `boolean` | `false` | Whether the banner can be dismissed by the user. |
| `onDismiss` | `() => void` | — | Called when the dismiss button is clicked; banner hides itself regardless of whether this is provided. |
| `endContent` | `ReactNode` | — | Action content rendered in the header area, end-aligned. Wraps to its own row below the text when the header is too narrow to hold both. |
| `container` | `'card' | 'section'` | `'card'` | Container type: card has border-radius; section is full-width with no border-radius for page-level use. |
| `elevation` | `'none' | 'low' | 'med' | 'high'` | `'none'` | Resting shadow depth. Use for a floating banner that hovers above content; `none` is the default inline banner. A `card`-container banner rounds its shadow to match. |
| `children` | `ReactNode` | — | Content rendered in the card-background area below the colored header. |
| `defaultIsExpanded` | `boolean` | `false` | Whether the content area (children) starts expanded. Only relevant when children are provided. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Pick a status that matches the message: info for updates, warning for caution, error for problems, success for confirmations.
- **Do:** Use the card container inside page content and the section container for full-width messages that span the entire page.
- **Do:** Make info and success banners dismissable. Keep error banners visible until the user fixes the issue.
- **Do:** Keep titles short and scannable: "Payment failed" not "There was a problem processing your most recent payment."
- **Don't:** Use Banner for short-lived messages that disappear on their own; use Toast instead.
- **Don't:** Stack multiple banners with the same status; combine related messages into one banner.
- **Do:** Error and warning banners render as role="alert"; info and success render as role="status". Mount an alert banner in response to an event rather than on first paint, so assistive tech has a change to report.
- **Don't:** Rely on the status color or icon alone to carry meaning; say which status it is in the title text, because the icon is decorative to a screen reader.

## Canonical defaults

```json
{
  "title": "System maintenance scheduled",
  "description": "The platform will be briefly unavailable on Sunday from 2–4 AM PST.",
  "status": "info"
}
```

## Theming

- `astryx-banner` — varies by: container, status
- `astryx-banner-icon` — varies by: status
- `astryx-banner-content` — varies by: container, status

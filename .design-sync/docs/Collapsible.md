---
category: Container
---

# Collapsible

Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in CollapsibleGroup for accordion behavior. For custom collapsible components, use the `useCollapsible` hook directly (`astryx hook useCollapsible`).

**Import:** `import {Collapsible} from '@astryxdesign/core/Collapsible';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Trigger | Yes | The always-visible button that toggles the content. Shows a label and a chevron indicator. |
| Chevron | No | Animated arrow that rotates to show open or closed state. |
| Content | No | The area that hides or reveals when the trigger is clicked. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactNode` | — | Content shown in the trigger area (always visible). |
| `children` | `ReactNode` | — | Content that collapses and expands. |
| `defaultIsOpen` | `boolean` | `true` | Default open state (uncontrolled). |
| `isOpen` | `boolean` | — | Controlled open state. |
| `isDisabled` | `boolean` | `false` | Disable the item so its trigger can't be toggled (dimmed, aria-disabled, and out of the tab order). Doesn't collapse an already-open item. |
| `onOpenChange` | `(isOpen: boolean) => void` | — | Callback invoked when the open state changes. |
| `value` | `string` | — | Identifier used for group coordination. Required when placed inside an CollapsibleGroup. |

## Best practices

- **Do:** Use hasDividers on CollapsibleGroup for FAQ-style lists: built-in row hairlines with themed border tokens, no hand-rolled borders.
- **Do:** Wrap each Collapsible in an Card for visual separation in accordion layouts, or use CollapsibleGroup's hasDividers for flat lists; don't combine both.
- **Do:** Use CollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.
- **Do:** Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.
- **Do:** Start sections open (defaultIsOpen) when the content is likely needed on first view; don't make users click to see essential info.
- **Don't:** Hide critical or required content behind a collapsible; users may not discover it.
- **Don't:** Nest collapsibles more than two levels deep; it makes content hard to find and navigate.
- **Don't:** Use a collapsible for a single short paragraph; just show the text directly instead.

## Canonical defaults

```json
{
  "trigger": "Click to expand",
  "children": {
    "__element": "Text",
    "props": {
      "type": "body"
    },
    "children": "This content is revealed when the collapsible is expanded. It can contain any components."
  }
}
```

## Theming

- `astryx-collapsible` — varies by: density
- `astryx-collapsible-trigger` — varies by: density
- `astryx-collapsible-content` — varies by: density
- `astryx-collapsible-group` — varies by: density

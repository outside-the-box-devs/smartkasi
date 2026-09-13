---
category: Action
---

# Segmented Control

A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.

**Import:** `import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The currently selected value (controlled). |
| `onChange` | `(value: string) => void` | — | Callback fired when a segment is selected. |
| `label` | `string` | — | Accessible label for the radio group (used as aria-label, never rendered visually). |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant for the control. |
| `layout` | `'hug' | 'fill'` | `'hug'` | Layout mode. hug (default) sizes segments to content; fill stretches them equally to fill the container. |
| `isDisabled` | `boolean` | `false` | Whether the entire control is disabled. |
| `disabledMessage` | `string` | — | Explains why the control is disabled. Applies to the whole-group disabled state (isDisabled), not per segment. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the control focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled SegmentedControl in Tooltip. Disabled controls swallow the hover events an external Tooltip needs. |
| `children` | `ReactNode` | — | SegmentedControlItem children. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.
- **Do:** Provide a descriptive label for the control to ensure the group is accessible to screen readers.
- **Don't:** Use for page-level navigation; use TabList instead. TabList is a navigation component, while SegmentedControl is an input that always has exactly one selected option.
- **Don't:** Use for simple on/off states; use ToggleButton instead. ToggleButton can be toggled on or off independently, while SegmentedControl enforces a single selection from a group.
- **Don't:** Wrap a disabled SegmentedControl in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.

## Canonical defaults

```json
{
  "value": "option-1"
}
```

## Theming

- `astryx-segmented-control` — varies by: size
- `astryx-segmented-control-item` — varies by: size

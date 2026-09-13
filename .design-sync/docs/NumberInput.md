---
category: Data Input
---

# Number Input

A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.

**Import:** `import {NumberInput} from '@astryxdesign/core/NumberInput';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Label | Yes | The label for the number input. |
| Description | No | Additional description text below the label. |
| Icon | No | An optional icon within the input. |
| Placeholder | No | Placeholder text shown when the input is empty. |
| Number steppers | No | Optional buttons that increment or decrement by the configured step. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label text for the input (always rendered for accessibility). |
| `value` | `number | null | undefined` | — | Current value of the input. |
| `onChange` | `(value: number) => void` | — | Callback fired when input value changes (only on valid input). |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant. |
| `isLabelHidden` | `boolean` | — | Visually hide the label (still accessible to screen readers). |
| `description` | `string` | — | Description text displayed between the label and input. |
| `isOptional` | `boolean` | — | Whether the field is optional (mutually exclusive with isRequired). |
| `isRequired` | `boolean` | — | Whether the field is required (mutually exclusive with isOptional). |
| `isDisabled` | `boolean` | — | Whether the input is disabled. |
| `isReadOnly` | `boolean` | `false` | Makes the input read-only: the value is shown at full opacity and still submits with the form, but cannot be edited. Unlike isDisabled, a read-only input is not dimmed and stays in the tab order. Stepping is off in every form while read-only: arrow keys, the wheel, and the number steppers. isDisabled takes precedence when both are set. |
| `disabledMessage` | `string` | — | Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled NumberInput in Tooltip. |
| `placeholder` | `string` | — | Placeholder text. |
| `labelTooltip` | `string` | — | Tooltip text to display in an info icon at the end of the label. |
| `startIcon` | `IconType` | — | Icon to display at the start of the input. See `astryx docs icons` for valid semantic names. |
| `labelIcon` | `IconType` | — | Icon to display before the label text. See `astryx docs icons` for valid semantic names. |
| `status` | `{type: 'error' | 'warning' | 'success', message?: string}` | — | Validation status with optional message. |
| `statusVariant` | `'attached' | 'detached' | 'tooltip'` | `'attached'` | How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing; tooltip hides the message box and surfaces it in a tooltip on the status icon. |
| `min` | `number | null` | — | Minimum value allowed. |
| `max` | `number | null` | — | Maximum value allowed. |
| `step` | `number | null` | `1` | Step increment for the input. |
| `formatValue` | `(value: number) => string` | — | Formats the committed value while the input is not focused. The raw numeric value is shown on focus for editing and the formatted value is exposed through aria-valuetext. |
| `isWheelEnabled` | `boolean` | `true` | Whether scrolling the wheel over the focused input steps the value. Disable this when page scrolling should always take priority. |
| `hasNumberSteppers` | `boolean` | `false` | Shows increment and decrement buttons at the end of the input. |
| `units` | `string | null` | — | Units text to display at the end of the input (e.g., "%" or "GB"). |
| `isIntegerOnly` | `boolean` | — | Only allow integer values (no floating point). |
| `hasClear` | `boolean` | `false` | Shows a clear (×) button when the input has a value. When true, the onChange callback also accepts null to signal the user cleared the input. |
| `htmlName` | `string` | — | HTML name attribute for form submissions. |
| `autoComplete` | `string` | — | HTML autocomplete attribute. |
| `width` | `SizeValue` | — | Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. |
| `hasAutoFocus` | `boolean` | — | Whether to focus the input on mount. |
| `onFocus` | `(e: FocusEvent<HTMLInputElement>) => void` | — | Callback fired when the input receives focus. |
| `onBlur` | `(e: FocusEvent<HTMLInputElement>) => void` | — | Callback fired when the input loses focus. |
| `onEnter` | `() => void` | — | Callback fired when the user presses the Enter key. |

## Best practices

- **Do:** Set min, max, and step to guide users toward valid values.
- **Do:** Show units (e.g. "%" or "GB") so users know what the number represents.
- **Do:** Set isWheelEnabled={false} when the input appears in a scrolling surface where wheel gestures should always scroll the page.
- **Don't:** Use NumberInput for free-form text that happens to contain numbers; use TextInput instead.
- **Don't:** Set both isOptional and isRequired on the same field.
- **Don't:** Wrap a disabled NumberInput in Tooltip to explain why it's disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.

## Theming

- `astryx-number-input` — varies by: size, status

---
category: Data Input
---

# Text Area

TextArea is a multi-line text input for collecting longer-form content like comments, descriptions, or messages. Use it when the expected input spans multiple lines. For shorter, single-line values, use TextInput.

**Import:** `import {TextArea} from '@astryxdesign/core/TextArea';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `ref` | `React.Ref<HTMLTextAreaElement>` | — | Ref forwarded to the underlying <textarea> element. |
| `label` | `string` | — | Label text for the textarea. Always rendered for accessibility. |
| `value` | `string` | — | Current value of the textarea. |
| `onChange` | `(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void` | — | Callback fired when the textarea value changes. |
| `changeAction` | `(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>` | — | Async action fired after onChange inside a React transition. Enables optimistic updates via useOptimistic. |
| `isLabelHidden` | `boolean` | `false` | Visually hides the label while keeping it accessible to screen readers. |
| `description` | `string` | — | Helper text displayed between the label and textarea. |
| `isOptional` | `boolean` | `false` | Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired. |
| `isRequired` | `boolean` | `false` | Displays a "Required" indicator next to the label and sets aria-required. Mutually exclusive with isOptional. |
| `isDisabled` | `boolean` | `false` | Disables the textarea, preventing interaction. |
| `isReadOnly` | `boolean` | `false` | Makes the textarea read-only: the value is shown at full opacity and still submits with the form, but cannot be edited. Unlike isDisabled, a read-only textarea is not dimmed and stays in the tab order. isDisabled takes precedence when both are set. |
| `disabledMessage` | `string` | — | Explains why the textarea is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the textarea focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled TextArea in Tooltip. Disabled controls swallow the hover events an external Tooltip needs. |
| `isLoading` | `boolean` | `false` | Puts the textarea in a loading state, showing a spinner inside the input. |
| `placeholder` | `string` | — | Placeholder text shown when the textarea is empty. |
| `rows` | `number` | `3` | Number of visible text rows. |
| `maxLength` | `number` | — | Maximum number of characters allowed, counted as user-perceived characters: an emoji or flag sequence counts as one. When set, a character counter (current/max) is displayed inside the input container, anchored to the bottom-right beneath the text. Does not enforce the limit natively; when exceeded the counter turns red and shows a warning icon (a non-color cue), and screen-reader users hear the remaining/over-limit count announced. Consumers validating the limit should count with characterCount (exported from the package) so enforcement matches the displayed count. |
| `status` | `{ type: 'warning' | 'error' | 'success'; message?: string }` | — | Status indicator that applies a colored border and icon. An optional message is displayed in a floating box below the textarea. |
| `statusVariant` | `'attached' | 'detached' | 'tooltip'` | `'attached'` | How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing; tooltip hides the message box and surfaces it in a tooltip on the status icon. |
| `labelTooltip` | `string` | — | Tooltip text displayed in an info icon at the end of the label. |
| `startIcon` | `IconType` | — | Icon component rendered inside the leading edge of the textarea wrapper. See `astryx docs icons` for valid semantic names. |
| `hasSpellCheck` | `boolean` | `true` | Enables or disables browser spell checking. |
| `hasAutoFocus` | `boolean` | `false` | Automatically focuses the textarea on mount. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size of the textarea, affecting internal padding. Height is controlled by rows, not size. |
| `onPaste` | `(e: ClipboardEvent<HTMLTextAreaElement>) => void` | — | Callback fired when content is pasted into the textarea. |
| `htmlName` | `string` | — | HTML name attribute for the textarea element, useful for form submissions. |
| `width` | `SizeValue` | — | Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. |
| `onFocus` | `(e: FocusEvent<HTMLTextAreaElement>) => void` | — | Callback fired when the textarea receives focus. |
| `onBlur` | `(e: FocusEvent<HTMLTextAreaElement>) => void` | — | Callback fired when the textarea loses focus. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |

## Best practices

- **Do:** Provide a visible label so users know what to enter. If the label must be hidden, set isLabelHidden with a descriptive label for screen readers.
- **Do:** Set maxLength with a character counter when there is a defined limit; it helps users stay within bounds before they submit.
- **Do:** Use the status prop to surface validation feedback inline: show success when input is valid, warning for soft limits, and error for hard failures.
- **Do:** Add a description or placeholder to clarify expected content, like "Describe the issue in detail," but never rely on placeholder alone as the only label.
- **Don't:** Avoid using TextArea for short, single-line values like names or emails; use TextInput instead.
- **Don't:** Don't rely solely on placeholder text to communicate the purpose of the field; placeholders disappear on focus and are not accessible labels.
- **Don't:** Don't show a status message without also setting the status type; the colored border and icon are what draw the user's attention to the message.
- **Don't:** Don't wrap a disabled TextArea in Tooltip to explain why it's disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.

## Theming

- `astryx-textarea` — varies by: size, status

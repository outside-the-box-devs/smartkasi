---
category: Data Input
---

# Selector

A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options. Keyboard typeahead matches a native select: typing on the focused closed trigger selects the matching option directly, repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits. With hasSearch, typing on the closed trigger opens the popup and seeds the search input.

**Import:** `import {Selector} from '@astryxdesign/core/Selector';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Label | No | Text label displayed above the selector. |
| Placeholder | No | Hint text shown when no value is selected. |
| Description | No | Helper text providing additional context. |
| Left Icon | No | Icon displayed to the left of the selected value. |
| Value | Yes | The currently selected item displayed in the selector. |
| List | Yes | The dropdown list of selectable options. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label text for accessibility. |
| `options` | `SelectorOption[]` | — | Array of items: strings, objects with value/label/description/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}). |
| `value` | `string` | — | Currently selected value. |
| `onChange` | `(value: string) => void` | — | Callback fired when the selection changes. |
| `hasClear` | `boolean` | `false` | Shows a clear (×) button when a value is selected. When true, onChange also accepts null to signal the user cleared the selection. |
| `hasSearch` | `boolean` | `false` | Whether to show a search input for filtering options. As the user types, the match count (or "No results found") is announced to screen readers via a polite live region. The search field has built-in affordances: a leading magnifier icon and, once a query is typed, a trailing clear (✕) button that resets the query and returns focus to the input. |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder text for the search input. |
| `placeholder` | `string` | `'Select...'` | Placeholder text shown when no value is selected. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant for the selector. |
| `variant` | `'input' | 'ghost'` | `'input'` | Visual trigger style. input is the bordered input treatment for forms; ghost is borderless and matches ghost buttons for toolbar usage. |
| `isDisabled` | `boolean` | `false` | Disables the selector. |
| `htmlName` | `string` | — | The HTML name attribute for form submissions. Renders a hidden input carrying the selected value, like a native select. |
| `disabledMessage` | `string` | — | Explains why the selector is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Selector in Tooltip. Disabled controls swallow the hover events an external Tooltip needs. |
| `isLabelHidden` | `boolean` | `false` | Visually hides the label while keeping it accessible. |
| `description` | `string` | — | Helper text displayed below the label. |
| `isOptional` | `boolean` | `false` | Marks the field as optional. |
| `isRequired` | `boolean` | `false` | Marks the field as required. |
| `status` | `{type: 'error' | 'warning' | 'success', message?: string}` | — | Validation status with an optional message. |
| `statusVariant` | `'attached' | 'detached' | 'tooltip'` | `'attached' for input selectors; 'detached' for ghost selectors` | How the status message is placed relative to the input. attached overlaps directly below the bordered input and is only valid for the input variant; ghost selectors detach attached status messages by default. Use tooltip for compact toolbar controls. |
| `renderOption` | `(option: SelectorOptionData) => ReactNode` | — | Custom render function for each selectable option in the dropdown. Use this instead of JSX children; dividers and sections are rendered by the selector. |
| `renderValue` | `(option: SelectorOptionData) => ReactNode` | — | Custom render function for the selected option inside the closed trigger. The trigger is sized by padding, so it is the size token for a one-line value (28/32/36) and exactly one text line taller for a two-line one (48/52/56) — always on the 4px rhythm, always aligned with the buttons and inputs beside it. Inside an InputGroup the group owns the row height: a SelectorOption folds onto one line and ellipsizes, and any taller node is cut off at the row. |
| `indicatorPosition` | `'start' | 'end'` | `'end'` | Which edge of the option row carries the selected mark. start reserves a mark column ahead of every label so they stay aligned, the way a native menu does; end is the house convention shared with Typeahead and CommandPalette. |
| `width` | `SizeValue` | — | Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Provide a visible label so users understand what they are selecting.
- **Do:** Use sections and dividers to organize options when the list exceeds ~8 items.
- **Do:** Use renderOption for custom option rows. Do not pass SelectorOption directly as JSX children.
- **Do:** Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").
- **Do:** Use inside InputGroup only when the selector needs a short prefix or suffix addon as part of one decorated input surface.
- **Do:** Use variant="ghost" when a selector sits in a toolbar with ghost buttons. If validation status is needed there, prefer statusVariant="tooltip" so the toolbar height stays compact.
- **Don't:** Use for action menus; use Dropdown Menu for triggering commands or navigation.
- **Don't:** Use when there are only two options; use a SegmentedControl or radio buttons instead.
- **Don't:** Use Selector for navigation; links should be links, not dropdown options.
- **Don't:** Use for yes/no or on/off choices; use Switch or CheckboxInput instead.
- **Don't:** Put more than ~20 options without sections; consider Typeahead for large lists.
- **Don't:** Wrap a disabled Selector in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.

## Theming

- `astryx-selector` — varies by: variant, size, status
- `astryx-selector-option`
- `astryx-selector-option-row` — varies by: size
- `astryx-selector-search`
- `astryx-selector-section-heading`
- `astryx-selector-empty-state`
- `astryx-selector-clear-icon`
- `astryx-selector-indicator-icon`
- `astryx-selector-check`
- `astryx-selector-popup`

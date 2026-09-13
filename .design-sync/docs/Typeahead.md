---
category: Data Input
---

# Typeahead

A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.

**Import:** `import {Typeahead} from '@astryxdesign/core/Typeahead';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible label for the input. |
| `searchSource` | `SearchSource<T>` | — | Data source providing search and bootstrap methods for populating the dropdown. |
| `value` | `T | null` | — | Currently selected item, or null if nothing is selected. |
| `onChange` | `(item: T | null) => void` | — | Called when the selection changes. |
| `placeholder` | `string` | — | Input placeholder text. |
| `hasEntriesOnFocus` | `boolean` | `false` | Show bootstrap results on focus before typing. |
| `hasClear` | `boolean` | `true` | Show clear button to deselect the current value. |
| `isDisabled` | `boolean` | `false` | Disables the input. |
| `disabledMessage` | `string` | — | Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip. Disabled controls swallow the hover events an external Tooltip needs. |
| `maxMenuItems` | `number` | `10` | Maximum number of dropdown items to display. |
| `status` | `{type: 'warning' | 'error' | 'success', message?: string}` | — | Validation status object with type and message for error/warning/success states. |
| `statusVariant` | `'attached' | 'detached'` | `'attached'` | How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing. |
| `renderItem` | `(item: T) => ReactNode` | — | Custom render function for dropdown items. Default renders TypeaheadItem. |
| `isLabelHidden` | `boolean` | `false` | Visually hides the label while keeping it accessible. |
| `description` | `string` | — | Helper text displayed below the label. |
| `isRequired` | `boolean` | `false` | Marks the field as required. |
| `isOptional` | `boolean` | `false` | Shows an optional indicator on the label. |
| `labelTooltip` | `string` | — | Tooltip text shown on the label. |
| `emptySearchResultsText` | `string` | `'No results found'` | Text shown when search returns no results. |
| `hasAutoFocus` | `boolean` | `false` | Auto-focus the input on mount. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Input and token size. |
| `debounceMs` | `number` | `150` | Debounce delay in ms before triggering search. Set to 0 for synchronous sources. |
| `onChangeQuery` | `(query: string) => void` | — | Callback fired when the search query text changes. |
| `onOpenChange` | `(isOpen: boolean) => void` | — | Callback when the dropdown opens or closes. |
| `width` | `SizeValue` | — | Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Provide descriptive placeholder text that hints at what users can search for.
- **Do:** Show suggestions on focus when users benefit from seeing popular or recent options before typing.
- **Do:** Add a search delay for remote data sources to avoid excessive network requests.
- **Do:** Use inside InputGroup when the typeahead needs a single-line prefix or suffix addon.
- **Don't:** Use for short, static option lists; use Selector for better discoverability.
- **Don't:** Use for multi-selection; use Tokenizer instead.
- **Don't:** Place multiple Typeaheads adjacent to each other without clear labels differentiating them.
- **Don't:** Wrap a disabled Typeahead in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.

## Theming

- `astryx-typeahead` — varies by: status, size
- `astryx-typeahead-dropdown`
- `astryx-typeahead-empty-state`
- `astryx-typeahead-item`

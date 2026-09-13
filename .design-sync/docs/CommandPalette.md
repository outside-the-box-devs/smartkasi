---
category: Overlay
---

# Command Palette

CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by SearchSource for filtering and selection.

**Import:** `import {CommandPalette} from '@astryxdesign/core/CommandPalette';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Whether the command palette dialog is visible. |
| `onOpenChange` | `(isOpen: boolean) => void` | — | Called when the palette visibility changes. |
| `searchSource` | `SearchSource<T>` | — | Search source providing items via search(query) and bootstrap(). Use createStaticSource for static lists. |
| `input` | `ReactNode` | `<CommandPaletteInput />` | Input slot. Defaults to CommandPaletteInput with standard behavior. |
| `footer` | `ReactNode` | `<CommandPaletteFooter />` | Footer slot. Defaults to CommandPaletteFooter showing keyboard hints. |
| `renderItem` | `(item: T, isSelected: boolean) => ReactNode` | — | Per-item render function. Auto-grouping by auxiliaryData.group is preserved. When omitted, renders label text. |
| `emptySearchText` | `ReactNode` | `'No results'` | Content shown when a search query returns no results. |
| `emptyBootstrapText` | `ReactNode` | `'Type to search'` | Content shown when there is no search query and bootstrap() returns nothing. |
| `value` | `string` | — | Controlled selected value for picker mode. |
| `onValueChange` | `(value: string) => void` | — | Called when the selected value changes in picker mode. |
| `label` | `string` | `'Command palette'` | Accessible label for the command palette dialog. |
| `width` | `number | string` | `640` | Width of the dialog. |
| `maxHeight` | `number | string` | `480` | Maximum height of the dialog. |
| `isInline` | `boolean` | `false` | Renders command palette content inline without modal behavior. Automatically disables input auto-focus and initial highlighted-item auto-scroll. For documentation previews and showcases only. |

## Best practices

- **Do:** Provide a searchSource with bootstrap results so users see useful options before typing.
- **Do:** Use auxiliaryData.group on items to automatically organize results into labeled sections.
- **Don't:** Use CommandPalette for simple dropdowns or menus; use Menu or Selector for inline selections.
- **Don't:** Add too many groups or items; curate results to keep the palette fast and scannable.

## Canonical defaults

```json
{
  "isOpen": true,
  "isInline": true
}
```

## Theming

- `astryx-command-palette-empty`
- `astryx-command-palette-footer`
- `astryx-command-palette-group`
- `astryx-command-palette-group-heading`
- `astryx-command-palette-input`
- `astryx-command-palette-item`
- `astryx-command-palette-list`

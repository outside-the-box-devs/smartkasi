---
category: Navigation
---

# Tab List

TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.

**Import:** `import {TabList} from '@astryxdesign/core/TabList';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Left Content | No | Most important area; hugs content width. |
| Center-Fill Content | No | Stretches to fill available space. |
| Right Content | No | Hugs content width. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The currently selected tab value. |
| `onChange` | `(value: string) => void` | — | Callback fired when a tab is selected. |
| `size` | `'sm' | 'md' | 'lg'` | `'md'` | Size variant applied to all child tabs. |
| `layout` | `'hug' | 'fill'` | `'hug'` | Layout mode for tab sizing. 'hug': each tab hugs its content width. 'fill': tabs stretch equally to fill the container width. |
| `hasDivider` | `boolean` | `false` | Whether to show a bottom border divider under the tab list. |
| `children` | `ReactNode` | — | Tab and TabMenu items to render inside the nav. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Keep tab labels short and descriptive so users can quickly scan available sections.
- **Do:** Use TabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.
- **Do:** When using hasDivider with action buttons alongside tabs, match the Button size to the TabList size (both md, both sm); the divided tab strip reserves space so tabs and same-size buttons align to a shared baseline above the rail.
- **Don't:** Use tabs for sequential steps or workflows; use a stepper or wizard pattern instead.
- **Don't:** Place more than 6–8 visible tabs before the overflow menu; prioritize the most important categories.
- **Don't:** Confuse TabList with SegmentedControl or ToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls: SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.

## Canonical defaults

```json
{
  "value": "tab-1"
}
```

## Theming

- `astryx-tab-list` — varies by: size
- `astryx-tab`
- `astryx-tab-indicator`
- `astryx-tab-menu`
- `astryx-tab-menu-dropdown`
- `astryx-tab-menu-item`

---
category: Content
---

# Kbd

Renders a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and help text to show key combinations.

**Import:** `import {Kbd} from '@astryxdesign/core/Kbd';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `keys` | `string` | — | Keyboard shortcut string. Use "+" to separate keys. Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}. |
| `className` | `string` | — | CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems. |
| `style` | `CSSProperties` | — | Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization. |

## Best practices

- **Do:** Place shortcuts near the action they trigger: in a tooltip, menu item, or inline instruction.
- **Do:** Use mod instead of ctrl or cmd; it automatically adapts to the user's platform.
- **Don't:** Use Kbd as the only way to discover an action; shortcuts should supplement visible controls, not replace them.

## Theming

- `astryx-kbd`

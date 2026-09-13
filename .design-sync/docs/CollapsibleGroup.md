---
category: Container
---

# Collapsible Group

**Import:** `import {CollapsibleGroup} from '@astryxdesign/core/Collapsible';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'single' | 'multiple'` | `'single'` | Whether one or many items can be open simultaneously. |
| `defaultValue` | `string | string[]` | — | Default open item(s) for uncontrolled usage. Use a string for single mode and an array for multiple mode. |
| `value` | `string | string[]` | — | Controlled open item(s). |
| `onChange` | `(value: string | string[]) => void` | — | Callback invoked when the set of open items changes. |
| `hasDividers` | `boolean` | `false` | Whether to draw hairline dividers between the group's items. When set, the group renders a wrapper div and items default to 'balanced' density. Pair with bare Collapsible children; Card-wrapped items provide their own separation. |
| `density` | `'compact' | 'balanced' | 'spacious'` | — | Row density controlling trigger and content block padding on the group's items. Defaults to 'balanced' when dividers are shown; otherwise items keep their default unpadded look. |
| `children` | `ReactNode` | — | Collapsible instances to coordinate. |

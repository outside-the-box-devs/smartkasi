---
category: Navigation
---

# Nav Icon

NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.

**Import:** `import {NavIcon} from '@astryxdesign/core/NavIcon';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — | The icon element to render inside the circular background. Should be an Icon or similar icon component. |

## Best practices

- **Do:** Use in navigation headers to provide a recognizable visual anchor for the section.
- **Do:** Pass an Icon or similarly sized icon component to ensure proper proportions.
- **Don't:** Use NavIcon for interactive purposes; it is a display-only container, not a button.

## Theming

- `astryx-navicon`

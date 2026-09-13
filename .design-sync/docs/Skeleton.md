---
category: Feedback & Status
---

# Skeleton

An animated shimmer placeholder that previews the shape of content while it loads. Use it to build loading screens that match the layout of the real content. For content with unknown dimensions, use Spinner instead.

**Import:** `import {Skeleton} from '@astryxdesign/core/Skeleton';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number | string` | `'100%'` | Width in pixels (number) or CSS value (string). |
| `height` | `number | string` | `'100%'` | Height in pixels (number) or CSS value (string). |
| `radius` | `'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'` | `3` | Border radius using design token scale. Use none for sharp corners, rounded for fully rounded (avatars, pills, circles). |
| `index` | `number` | `0` | Index for staggered animation timing. For element at index n, animation starts at DELAY_TIME + (STAGGER_TIME × n). |

## Best practices

- **Do:** Match the size and shape of the content being loaded to create a realistic placeholder.
- **Do:** Stagger multiple skeletons with the `index` prop for a natural wave animation.
- **Don't:** Use when the content dimensions are unknown; use Spinner instead.
- **Don't:** Combine with a Spinner on the same content area; pick one loading pattern.
- **Don't:** Show skeletons indefinitely; if loading takes too long, show an error or empty state instead.

## Canonical defaults

```json
{
  "width": 320,
  "height": 80
}
```

## Theming

- `astryx-skeleton`

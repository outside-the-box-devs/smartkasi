---
category: Layout
---

# Stack

Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.

**Import:** `import {Stack} from '@astryxdesign/core/Stack';`

## Best practices

- **Do:** Use the gap prop for spacing between items; don't add margins manually.
- **Do:** Use StackItem with size="fill" to make one item stretch and fill the leftover space.
- **Don't:** Nest stacks inside stacks; try wrap="wrap" first to let items flow to the next line.

## Theming

- `astryx-stack` — varies by: direction, gap, wrap
- `astryx-stack-item` — varies by: size

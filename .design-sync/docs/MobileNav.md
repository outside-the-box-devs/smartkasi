---
category: Navigation
---

# Mobile Nav

A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical. Inside AppShell, use MobileNavToggle as the trigger; it reads state from context automatically.

**Import:** `import {MobileNav} from '@astryxdesign/core/MobileNav';`

## Best practices

- **Do:** Share the same nav items between MobileNav and SideNav by extracting them into a variable.
- **Do:** Provide a header when the drawer's purpose is not obvious from its content.
- **Do:** Inside AppShell, use MobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.
- **Don't:** Use MobileNav on desktop: use a persistent SideNav instead.

## Theming

- `astryx-mobile-nav` — varies by: side

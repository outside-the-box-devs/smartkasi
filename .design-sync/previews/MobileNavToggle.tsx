import {MobileNavToggle} from '@astryxdesign/core/MobileNav';
import {AppShellMobileContext} from '@astryxdesign/core/AppShell';
import type {AppShellMobileContextValue} from '@astryxdesign/core/AppShell';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {HStack} from '@astryxdesign/core/Stack';

// MobileNavToggle reads isMobile/isMobileNavEnabled from AppShell context and
// renders null above the mobile breakpoint. Outside AppShell — as in every
// card here — it needs that context supplied directly to render at all.
const mobileClosed: AppShellMobileContextValue = {
  isMobile: true,
  isMobileNavOpen: false,
  isMobileNavEnabled: true,
  hasAutoToggle: true,
  toggleMobileNav: () => {},
  openMobileNav: () => {},
  closeMobileNav: () => {},
};

const mobileOpen: AppShellMobileContextValue = {...mobileClosed, isMobileNavOpen: true};

/**
 * The toggle as it sits in the SmartKasi header on a phone: a hamburger next
 * to the page title that opens the MobileNav drawer.
 */
export const InPageHeader = () => (
  <AppShellMobileContext.Provider value={mobileClosed}>
    <HStack gap={2} vAlign="center">
      <MobileNavToggle />
      <Heading level={4}>Stock on hand</Heading>
    </HStack>
  </AppShellMobileContext.Provider>
);

/** Closed and open — `aria-expanded` is what carries the state, not the icon. */
export const ClosedAndOpen = () => (
  <HStack gap={6} vAlign="center">
    <AppShellMobileContext.Provider value={mobileClosed}>
      <HStack gap={2} vAlign="center">
        <MobileNavToggle />
        <Badge variant="neutral" label="Closed" />
      </HStack>
    </AppShellMobileContext.Provider>
    <AppShellMobileContext.Provider value={mobileOpen}>
      <HStack gap={2} vAlign="center">
        <MobileNavToggle />
        <Badge variant="info" label="Open" />
      </HStack>
    </AppShellMobileContext.Provider>
  </HStack>
);

/** Inside a Toolbar, where the size cascade matches it to its neighbours. */
export const InToolbar = () => (
  <AppShellMobileContext.Provider value={mobileClosed}>
    <Toolbar
      label="Stock on hand"
      size="sm"
      startContent={<MobileNavToggle />}
      centerContent={<Heading level={5}>Stock on hand</Heading>}
    />
  </AppShellMobileContext.Provider>
);

/** A custom label — `children` can also swap in a different icon entirely. */
export const CustomLabel = () => (
  <AppShellMobileContext.Provider value={mobileClosed}>
    <MobileNavToggle label="Show shop menu" />
  </AppShellMobileContext.Provider>
);

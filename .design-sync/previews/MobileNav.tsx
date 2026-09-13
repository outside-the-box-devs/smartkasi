import {MobileNav} from '@astryxdesign/core/MobileNav';
import {SideNavHeading, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {BuildingStorefrontIcon as StoreSolid} from '@heroicons/react/24/solid';

/**
 * MobileNav is the phone counterpart to SideNav — same section/item children,
 * a full-height drawer instead of a persistent rail. `isOpen` is set directly
 * here because there is no AppShell around this preview to own the state.
 */
export const OpenDrawer = () => (
  <MobileNav
    isOpen
    onOpenChange={() => {}}
    header={
      <SideNavHeading
        icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
        heading="SmartKasi"
      />
    }
  >
    <SideNavSection title="Operations">
      <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
      <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
      <SideNavItem label="Map" icon={MapIcon} />
      <SideNavItem label="Orders" icon={ShoppingBagIcon} />
    </SideNavSection>
  </MobileNav>
);

/** A plain string header — the compact option when no branding icon is needed. */
export const TextHeader = () => (
  <MobileNav isOpen onOpenChange={() => {}} header="Navigation">
    <SideNavSection title="This shop">
      <SideNavItem label="Stock" isSelected />
      <SideNavItem label="Sell" />
      <SideNavItem label="Flyers" />
    </SideNavSection>
  </MobileNav>
);

/** `side="end"` slides in from the right — useful when the toggle sits there too. */
export const FromEndEdge = () => (
  <MobileNav
    isOpen
    onOpenChange={() => {}}
    side="end"
    header={
      <SideNavHeading
        icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
        heading="SmartKasi"
      />
    }
  >
    <SideNavSection title="Operations">
      <SideNavItem label="Dashboard" icon={HomeIcon} />
      <SideNavItem
        label="Orders"
        icon={ShoppingBagIcon}
        isSelected
        endContent={<Badge variant="warning" label="7" />}
      />
    </SideNavSection>
  </MobileNav>
);

/** A narrower `width` for a small Android screen, with order counts attached. */
export const NarrowWidth = () => (
  <MobileNav
    isOpen
    onOpenChange={() => {}}
    width={240}
    header={
      <SideNavHeading
        icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
        heading="SmartKasi"
      />
    }
  >
    <SideNavSection title="Operations">
      <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
      <SideNavItem
        label="Shops"
        icon={BuildingStorefrontIcon}
        endContent={<Text type="supporting">3</Text>}
      />
      <SideNavItem label="Map" icon={MapIcon} />
    </SideNavSection>
  </MobileNav>
);

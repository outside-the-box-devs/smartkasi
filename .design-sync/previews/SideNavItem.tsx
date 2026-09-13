import type {ReactNode} from 'react';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Stack';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  BuildingStorefrontIcon as StoreSolid,
  MapIcon as MapSolid,
  ShoppingBagIcon as BagSolid,
} from '@heroicons/react/24/solid';

/** Items only render inside a SideNav — that is the only true preview. */
const Frame = ({children}: {children: ReactNode}) => (
  <VStack style={{height: 360, alignItems: 'stretch'}}>{children}</VStack>
);

const brand = (
  <SideNavHeading
    icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
    heading="SmartKasi"
  />
);

/**
 * The four destinations of the dashboard. Pair icon with selectedIcon so
 * the current page is filled, not just tinted — isSelected also sets
 * aria-current="page".
 */
export const Destinations = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations">
        <SideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeSolid}
          href="/dashboard"
        />
        <SideNavItem
          label="Shops"
          icon={BuildingStorefrontIcon}
          selectedIcon={StoreSolid}
          href="/dashboard/shops"
          isSelected
        />
        <SideNavItem label="Map" icon={MapIcon} selectedIcon={MapSolid} href="/dashboard/map" />
        <SideNavItem
          label="Orders"
          icon={ShoppingBagIcon}
          selectedIcon={BagSolid}
          href="/dashboard/orders"
        />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * endContent is for a count the owner must act on — order legs still
 * pending, products that have run low — never for decoration.
 */
export const WithCounts = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} isSelected />
        <SideNavItem
          label="Shops"
          icon={BuildingStorefrontIcon}
          selectedIcon={StoreSolid}
          endContent={<Badge variant="neutral" label="3" />}
        />
        <SideNavItem
          label="Orders"
          icon={ShoppingBagIcon}
          selectedIcon={BagSolid}
          endContent={<Badge variant="warning" label="7" />}
        />
        <SideNavItem
          label="Flyers"
          icon={MegaphoneIcon}
          endContent={<Badge variant="info" label="New" />}
        />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * children nest a level of hierarchy. An owner with several shops drills
 * from "Shops" straight to the one they are standing in.
 */
export const NestedShops = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} />
        <SideNavItem
          label="Shops"
          icon={BuildingStorefrontIcon}
          selectedIcon={StoreSolid}
          collapsible
        >
          <SideNavItem label="Thoko's Spaza" isSelected />
          <SideNavItem label="Kasi Corner Store" />
          <SideNavItem label="Mama Ndlovu Tuck Shop" />
        </SideNavItem>
        <SideNavItem label="Orders" icon={ShoppingBagIcon} selectedIcon={BagSolid} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * States, top to bottom: current page, resting, and disabled — the map is
 * unavailable until the shop's address has been confirmed, so the link is
 * greyed rather than hidden and the owner knows the feature exists.
 */
export const States = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} selectedIcon={StoreSolid} />
        <SideNavItem label="Map" icon={MapIcon} selectedIcon={MapSolid} isDisabled />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} selectedIcon={BagSolid} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

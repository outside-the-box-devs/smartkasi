import type {ReactNode} from 'react';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  BuildingStorefrontIcon as StoreSolid,
  MapIcon as MapSolid,
  ShoppingBagIcon as BagSolid,
} from '@heroicons/react/24/solid';

/**
 * SideNav fills the height its parent gives it — inside the product that
 * parent is AppShell. These cards stand in for it with a fixed frame.
 */
const Frame = ({children}: {children: ReactNode}) => (
  <VStack style={{height: 420, alignItems: 'stretch'}}>{children}</VStack>
);

const brand = (
  <SideNavHeading
    icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
    heading="SmartKasi"
    headingHref="/dashboard"
  />
);

/**
 * The navigation this product actually ships: four destinations in one
 * section, branded header, account footer. Outline icons unselected, filled
 * when selected, so the current page reads without relying on colour.
 */
export const DashboardNav = () => (
  <Frame>
    <SideNav
      header={brand}
      footer={
        <VStack gap={2}>
          <Text type="supporting">thoko@kasicorner.co.za</Text>
          <Button size="sm" variant="ghost" label="Sign out" />
        </VStack>
      }
    >
      <SideNavSection title="Operations">
        <SideNavItem
          label="Dashboard"
          icon={HomeIcon}
          selectedIcon={HomeSolid}
          href="/dashboard"
          isSelected
        />
        <SideNavItem
          label="Shops"
          icon={BuildingStorefrontIcon}
          selectedIcon={StoreSolid}
          href="/dashboard/shops"
        />
        <SideNavItem
          label="Map"
          icon={MapIcon}
          selectedIcon={MapSolid}
          href="/dashboard/map"
        />
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
 * topContent holds the one action an owner starts most days with, and
 * endContent carries the count of orders still waiting to be accepted.
 */
export const WithOrderCounts = () => (
  <Frame>
    <SideNav
      header={brand}
      topContent={
        <Button
          size="sm"
          variant="primary"
          label="New sale"
          icon={<PlusIcon style={{width: 14, height: 14}} />}
          width="100%"
        />
      }
    >
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} />
        <SideNavItem
          label="Shops"
          icon={BuildingStorefrontIcon}
          selectedIcon={StoreSolid}
          endContent={<Badge variant="neutral" label="3" />}
        />
        <SideNavItem label="Map" icon={MapIcon} selectedIcon={MapSolid} />
        <SideNavItem
          label="Orders"
          icon={ShoppingBagIcon}
          selectedIcon={BagSolid}
          isSelected
          endContent={<Badge variant="warning" label="7" />}
        />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * collapsible adds the toggle. Expanded is the default on a tablet behind
 * the counter, where the labels are what a non-technical owner navigates by.
 */
export const Collapsible = () => (
  <Frame>
    <SideNav header={brand} collapsible>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} selectedIcon={StoreSolid} />
        <SideNavItem label="Map" icon={MapIcon} selectedIcon={MapSolid} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} selectedIcon={BagSolid} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * Collapsed to an icon rail — buys back screen width on a small Android
 * tablet. Labels survive as tooltips and as the accessible name.
 */
export const Collapsed = () => (
  <Frame>
    <SideNav header={brand} collapsible={{defaultIsCollapsed: true}}>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeSolid} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} selectedIcon={StoreSolid} />
        <SideNavItem label="Map" icon={MapIcon} selectedIcon={MapSolid} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} selectedIcon={BagSolid} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

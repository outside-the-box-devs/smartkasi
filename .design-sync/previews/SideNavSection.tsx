import type {ReactNode} from 'react';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Stack';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
  CubeIcon,
  BanknotesIcon,
  MegaphoneIcon,
  DocumentCheckIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {BuildingStorefrontIcon as StoreSolid} from '@heroicons/react/24/solid';

/** Sections only render inside a SideNav. */
const Frame = ({children}: {children: ReactNode}) => (
  <VStack style={{height: 560, alignItems: 'stretch'}}>{children}</VStack>
);

const brand = (
  <SideNavHeading
    icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
    heading="SmartKasi"
  />
);

/**
 * Sections are how an owner scans for a destination: what the business
 * does, what this one shop needs, and where to get help.
 */
export const GroupedDestinations = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
        <SideNavItem label="Map" icon={MapIcon} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} />
      </SideNavSection>
      <SideNavSection title="This shop">
        <SideNavItem label="Licence" icon={DocumentCheckIcon} />
        <SideNavItem label="Stock" icon={CubeIcon} />
        <SideNavItem label="Sell" icon={BanknotesIcon} />
        <SideNavItem label="Flyers" icon={MegaphoneIcon} />
      </SideNavSection>
      <SideNavSection title="Help">
        <SideNavItem label="How to use SmartKasi" icon={QuestionMarkCircleIcon} />
        <SideNavItem label="Settings" icon={Cog6ToothIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * A subtitle answers "which one am I looking at" without a second click —
 * useful when the same section repeats per shop.
 */
export const WithSubtitle = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Thoko's Spaza" subtitle="Orlando East · Verified">
        <SideNavItem label="Overview" icon={HomeIcon} isSelected />
        <SideNavItem label="Stock" icon={CubeIcon} />
        <SideNavItem label="Sell" icon={BanknotesIcon} />
      </SideNavSection>
      <SideNavSection title="Kasi Corner Store" subtitle="Diepkloof · Under review">
        <SideNavItem label="Overview" icon={HomeIcon} />
        <SideNavItem label="Stock" icon={CubeIcon} />
        <SideNavItem label="Sell" icon={BanknotesIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * endContent puts one action against the group it belongs to — adding a
 * shop from the list of shops, rather than hiding it in a settings page.
 */
export const WithEndAction = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection
        title="Your shops"
        endContent={
          <IconButton
            size="sm"
            variant="ghost"
            label="Add a shop"
            icon={<PlusIcon style={{width: 14, height: 14}} />}
          />
        }
      >
        <SideNavItem label="Thoko's Spaza" icon={BuildingStorefrontIcon} isSelected />
        <SideNavItem label="Kasi Corner Store" icon={BuildingStorefrontIcon} />
        <SideNavItem label="Mama Ndlovu Tuck Shop" icon={BuildingStorefrontIcon} />
      </SideNavSection>
      <SideNavSection
        title="Orders"
        endContent={<Badge variant="warning" label="7" />}
      >
        <SideNavItem label="Pending" icon={ShoppingBagIcon} />
        <SideNavItem label="Accepted" icon={ShoppingBagIcon} />
        <SideNavItem label="Ready" icon={ShoppingBagIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * isHeaderHidden keeps the grouping for a screen reader but drops the
 * visible title — right when the nav has only one group and a title would
 * just be noise above four links.
 */
export const HiddenHeading = () => (
  <Frame>
    <SideNav header={brand}>
      <SideNavSection title="Operations" isHeaderHidden>
        <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
        <SideNavItem label="Map" icon={MapIcon} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

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
  CubeIcon,
  BanknotesIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import {BuildingStorefrontIcon as StoreSolid} from '@heroicons/react/24/solid';

/** SideNavHeading only renders inside a SideNav header slot. */
const Frame = ({children}: {children: ReactNode}) => (
  <VStack style={{height: 340, alignItems: 'stretch'}}>{children}</VStack>
);

/**
 * The product identity: icon plus name, linked back to the dashboard. This
 * is the header the SmartKasi dashboard ships.
 */
export const ProductHeading = () => (
  <Frame>
    <SideNav
      header={
        <SideNavHeading
          icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
          heading="SmartKasi"
          headingHref="/dashboard"
        />
      }
    >
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
        <SideNavItem label="Map" icon={MapIcon} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * Three lines of context for an owner who runs more than one shop: the
 * product above, the shop they are in, the township below.
 */
export const ShopWorkspace = () => (
  <Frame>
    <SideNav
      header={
        <SideNavHeading
          icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
          superheading="SmartKasi"
          superheadingHref="/dashboard"
          heading="Thoko's Spaza"
          headingHref="/dashboard/shops/thokos-spaza"
          subheading="Orlando East"
        />
      }
    >
      <SideNavSection title="This shop">
        <SideNavItem label="Stock" icon={CubeIcon} isSelected />
        <SideNavItem label="Sell" icon={BanknotesIcon} />
        <SideNavItem label="Flyers" icon={MegaphoneIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

/**
 * headerEndContent is for one small, glanceable signal. Offline-first means
 * the owner needs to know whether today's sales have reached the server.
 */
export const WithSyncStatus = () => (
  <Frame>
    <SideNav
      header={
        <SideNavHeading
          icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
          heading="SmartKasi"
          subheading="Kasi Corner Store"
          headerEndContent={<Badge variant="warning" label="Offline" />}
        />
      }
    >
      <SideNavSection title="Operations">
        <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
        <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
        <SideNavItem label="Orders" icon={ShoppingBagIcon} />
      </SideNavSection>
    </SideNav>
  </Frame>
);

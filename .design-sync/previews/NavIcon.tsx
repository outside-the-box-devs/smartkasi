import {NavIcon} from '@astryxdesign/core/NavIcon';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  BuildingStorefrontIcon as StoreSolid,
  MapIcon as MapSolid,
  ShoppingBagIcon as BagSolid,
  BanknotesIcon as MoneySolid,
} from '@heroicons/react/24/solid';

/**
 * The SmartKasi brand mark: a shopfront on the theme's accent circle. Size
 * the icon itself at 16px — NavIcon supplies the circle, not the scaling.
 */
export const BrandMark = () => (
  <HStack gap={3} style={{alignItems: 'center'}}>
    <NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />
    <Text type="large" weight="semibold">
      SmartKasi
    </Text>
  </HStack>
);

/** Where it belongs in the product: the icon slot of the side nav header. */
export const InNavHeading = () => (
  <VStack style={{height: 300, alignItems: 'stretch'}}>
    <SideNav
      header={
        <SideNavHeading
          icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
          heading="SmartKasi"
          subheading="Thoko's Spaza"
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
  </VStack>
);

/**
 * One mark per area of the product, as a section anchor. NavIcon is display
 * only — never make it the thing the owner taps.
 */
export const SectionAnchors = () => (
  <VStack gap={4}>
    <HStack gap={3} style={{alignItems: 'center'}}>
      <NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />
      <VStack gap={0.5}>
        <Text weight="semibold">Shops</Text>
        <Text type="supporting">3 shops across Soweto</Text>
      </VStack>
    </HStack>
    <HStack gap={3} style={{alignItems: 'center'}}>
      <NavIcon icon={<MapSolid style={{width: 16, height: 16}} />} />
      <VStack gap={0.5}>
        <Text weight="semibold">Map</Text>
        <Text type="supporting">Orlando East, Diepkloof, Meadowlands</Text>
      </VStack>
    </HStack>
    <HStack gap={3} style={{alignItems: 'center'}}>
      <NavIcon icon={<BagSolid style={{width: 16, height: 16}} />} />
      <VStack gap={0.5}>
        <Text weight="semibold">Orders</Text>
        <Text type="supporting">7 waiting to be accepted</Text>
      </VStack>
    </HStack>
    <HStack gap={3} style={{alignItems: 'center'}}>
      <NavIcon icon={<MoneySolid style={{width: 16, height: 16}} />} />
      <VStack gap={0.5}>
        <Text weight="semibold">Sell</Text>
        <Text type="supporting">Cash takings today R 4 820.50</Text>
      </VStack>
    </HStack>
  </VStack>
);

import {useState} from 'react';
import type {ReactNode} from 'react';
import {
  SideNav,
  SideNavCollapseButton,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {BuildingStorefrontIcon as StoreSolid} from '@heroicons/react/24/solid';

const Frame = ({children}: {children: ReactNode}) => (
  <VStack style={{height: 380, alignItems: 'stretch'}}>{children}</VStack>
);

const brand = (
  <SideNavHeading
    icon={<NavIcon icon={<StoreSolid style={{width: 16, height: 16}} />} />}
    heading="SmartKasi"
  />
);

const destinations = (
  <SideNavSection title="Operations">
    <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
    <SideNavItem label="Shops" icon={BuildingStorefrontIcon} />
    <SideNavItem label="Map" icon={MapIcon} />
    <SideNavItem label="Orders" icon={ShoppingBagIcon} />
  </SideNavSection>
);

/**
 * The house position: in the footer icon bar, beside the other footer
 * icons. The row cascades size 'sm', so the toggle matches its neighbours
 * without being told to.
 */
export const InFooterIcons = () => (
  <Frame>
    <SideNav
      header={brand}
      collapsible={{hasButton: false}}
      footerIcons={
        <HStack gap={1} style={{alignItems: 'center'}}>
          <IconButton
            variant="ghost"
            label="Settings"
            icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          />
          <SideNavCollapseButton />
        </HStack>
      }
    >
      {destinations}
    </SideNav>
  </Frame>
);

/**
 * Collapsed, the same button mirrors its chevron to point outward, and its
 * accessible name flips to "Expand". `label` overrides that name only — the
 * button is always icon-only, so a label never becomes visible text.
 */
export const WhenCollapsed = () => (
  <Frame>
    <SideNav
      header={brand}
      collapsible={{defaultIsCollapsed: true, hasButton: false}}
      footerIcons={<SideNavCollapseButton label="Show the menu" />}
    >
      {destinations}
    </SideNav>
  </Frame>
);

/**
 * Rendered outside the nav, the button cannot reach collapse context — so
 * hand it the same controlled config the SideNav got and the two stay in
 * step. Here the content area beside the rail owns the toggle.
 */
export const ControlledOutside = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const collapsible = {isCollapsed, onCollapsedChange: setIsCollapsed};

  return (
    <HStack gap={4} style={{height: 380, alignItems: 'stretch'}}>
      <SideNav header={brand} collapsible={{...collapsible, hasButton: false}}>
        {destinations}
      </SideNav>
      <VStack gap={3} style={{width: 200, paddingTop: 12}}>
        <SideNavCollapseButton collapsible={collapsible} label="Show the menu" size="md" />
        <Text type="supporting">
          One collapse state, two places to drive it from.
        </Text>
      </VStack>
    </HStack>
  );
};

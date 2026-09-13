import {TabList, Tab, TabMenu} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {
  Cog6ToothIcon,
  DocumentCheckIcon,
  HomeIcon,
  MegaphoneIcon,
  BanknotesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

/**
 * The shop page's own tabs — navigation between views, not an input, so this
 * is TabList and not SegmentedControl.
 */
export const ShopTabs = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" icon={<HomeIcon />} />
    <Tab value="licence" label="Licence" icon={<DocumentCheckIcon />} />
    <Tab value="stock" label="Stock" icon={<CubeIcon />} />
    <Tab value="sell" label="Sell" icon={<BanknotesIcon />} />
    <Tab value="flyers" label="Flyers" icon={<MegaphoneIcon />} />
  </TabList>
);

/** Sizes, matched to the page they sit at the top of. */
export const Sizes = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <TabList size="sm" value="stock" onChange={() => {}} label="Shop sections (sm)">
      <Tab value="overview" label="Overview" />
      <Tab value="stock" label="Stock" />
      <Tab value="sell" label="Sell" />
    </TabList>
    <TabList size="md" value="stock" onChange={() => {}} label="Shop sections (md)">
      <Tab value="overview" label="Overview" />
      <Tab value="stock" label="Stock" />
      <Tab value="sell" label="Sell" />
    </TabList>
    <TabList size="lg" value="stock" onChange={() => {}} label="Shop sections (lg)">
      <Tab value="overview" label="Overview" />
      <Tab value="stock" label="Stock" />
      <Tab value="sell" label="Sell" />
    </TabList>
  </VStack>
);

/**
 * `layout="fill"` stretches tabs to the full width — the shape a phone screen
 * wants; `hug` (default) sizes each to its label.
 */
export const HugVersusFill = () => (
  <VStack gap={5} style={{width: 360}}>
    <VStack gap={1}>
      <Text type="supporting">hug — sized to the words</Text>
      <TabList value="stock" onChange={() => {}} label="Shop sections" layout="hug">
        <Tab value="overview" label="Overview" />
        <Tab value="stock" label="Stock" />
        <Tab value="sell" label="Sell" />
      </TabList>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">fill — split the row evenly</Text>
      <TabList value="stock" onChange={() => {}} label="Shop sections" layout="fill">
        <Tab value="overview" label="Overview" />
        <Tab value="stock" label="Stock" />
        <Tab value="sell" label="Sell" />
      </TabList>
    </VStack>
  </VStack>
);

/** `hasDivider` separates the tab strip from the content that scrolls beneath it. */
export const WithDivider = () => (
  <VStack gap={0} style={{width: 360}}>
    <TabList value="stock" onChange={() => {}} label="Shop sections" hasDivider>
      <Tab value="overview" label="Overview" />
      <Tab value="stock" label="Stock" endContent={<Badge variant="warning" label="2" />} />
      <Tab value="sell" label="Sell" />
    </TabList>
    <Text type="supporting" style={{paddingTop: 8}}>
      2 products running low
    </Text>
  </VStack>
);

/**
 * TabMenu groups overflow items behind one trigger once the strip has more
 * destinations than fit — Settings and Help are still tabs, just tucked away.
 */
export const WithOverflowMenu = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" />
    <Tab value="stock" label="Stock" />
    <Tab value="sell" label="Sell" />
    <Tab value="flyers" label="Flyers" />
    <TabMenu
      label="More"
      options={[
        {value: 'settings', label: 'Settings', icon: <Cog6ToothIcon />},
        {value: 'help', label: 'How to use SmartKasi'},
      ]}
    />
  </TabList>
);

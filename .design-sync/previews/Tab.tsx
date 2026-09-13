import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Stack';
import {
  BanknotesIcon,
  CubeIcon,
  DocumentCheckIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import {
  BanknotesIcon as BanknotesSolid,
  CubeIcon as CubeSolid,
  DocumentCheckIcon as DocumentSolid,
  HomeIcon as HomeSolid,
} from '@heroicons/react/24/solid';

/**
 * A Tab only renders inside its TabList — the parent owns `value`, the tab
 * declares which value it stands for. Selected here is "Stock".
 */
export const LabelOnly = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" />
    <Tab value="stock" label="Stock" />
    <Tab value="sell" label="Sell" />
  </TabList>
);

/** `icon` shows outlined at rest; `selectedIcon` fills in on the active tab. */
export const OutlineToFilledIcon = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" icon={<HomeIcon />} selectedIcon={<HomeSolid />} />
    <Tab value="licence" label="Licence" icon={<DocumentCheckIcon />} selectedIcon={<DocumentSolid />} />
    <Tab value="stock" label="Stock" icon={<CubeIcon />} selectedIcon={<CubeSolid />} />
    <Tab value="sell" label="Sell" icon={<BanknotesIcon />} selectedIcon={<BanknotesSolid />} />
  </TabList>
);

/** `endContent` carries a count the owner has to act on — never decoration. */
export const WithEndContentBadge = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" />
    <Tab value="stock" label="Stock" endContent={<Badge variant="warning" label="2" />} />
    <Tab value="orders" label="Orders" endContent={<Badge variant="error" label="3" />} />
  </TabList>
);

/**
 * `href` renders the tab as a real link — right for a tab strip that changes
 * the URL, like the shop sections in `apps/web`.
 */
export const LinkTabs = () => (
  <TabList value="/dashboard/shops/thokos-spaza" onChange={() => {}} label="Shop sections">
    <Tab value="/dashboard/shops/thokos-spaza" label="Overview" href="/dashboard/shops/thokos-spaza" />
    <Tab value="/dashboard/shops/thokos-spaza/stock" label="Stock" href="/dashboard/shops/thokos-spaza/stock" />
    <Tab value="/dashboard/shops/thokos-spaza/sell" label="Sell" href="/dashboard/shops/thokos-spaza/sell" />
  </TabList>
);

/**
 * `isLabelHidden` drops to the icon alone with `label` as the accessible
 * name — only where the icon is unmistakable and the strip is tight.
 */
export const LabelHidden = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <TabList value="stock" onChange={() => {}} label="Shop sections, icon only">
      <Tab value="overview" label="Overview" icon={<HomeIcon />} isLabelHidden />
      <Tab value="stock" label="Stock" icon={<CubeIcon />} isLabelHidden />
      <Tab value="sell" label="Sell" icon={<BanknotesIcon />} isLabelHidden />
    </TabList>
  </VStack>
);

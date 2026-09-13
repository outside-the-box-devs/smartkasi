import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {
  BanknotesIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  ListBulletIcon,
  MegaphoneIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

/**
 * An item only ever renders inside its SegmentedControl: the parent owns
 * `value`, the item declares which value it stands for. Selected here is
 * "Full store".
 */
export const LabelOnly = () => (
  <SegmentedControl value="full" onChange={() => {}} label="Shop type">
    <SegmentedControlItem value="full" label="Full store" />
    <SegmentedControlItem value="stock" label="Stock only" />
    <SegmentedControlItem value="ads" label="Advertising only" />
  </SegmentedControl>
);

/** `icon` sits before the label and gives a non-reader a second cue. */
export const WithIcons = () => (
  <SegmentedControl value="full" onChange={() => {}} label="Shop type">
    <SegmentedControlItem value="full" label="Full store" icon={<BuildingStorefrontIcon />} />
    <SegmentedControlItem value="stock" label="Stock only" icon={<BanknotesIcon />} />
    <SegmentedControlItem value="ads" label="Advertising only" icon={<MegaphoneIcon />} />
  </SegmentedControl>
);

/**
 * `isLabelHidden` drops to the icon alone and keeps `label` as the accessible
 * name. Only do this where the icon is unmistakable — a grid and a list are;
 * a shop type is not.
 */
export const IconOnly = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Text type="label">How to show your stock</Text>
    <SegmentedControl value="rows" onChange={() => {}} label="Stock layout">
      <SegmentedControlItem value="rows" label="Rows" icon={<ListBulletIcon />} isLabelHidden />
      <SegmentedControlItem value="grid" label="Grid" icon={<Squares2X2Icon />} isLabelHidden />
      <SegmentedControlItem value="ledger" label="Ledger" icon={<BookOpenIcon />} isLabelHidden />
    </SegmentedControl>
  </VStack>
);

/**
 * One segment off while the rest stay live — a shop that has not submitted a
 * licence cannot be filtered to "Verified". Disable the item, not the group.
 */
export const OneItemDisabled = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Text type="label">Trading licence</Text>
    <SegmentedControl value="review" onChange={() => {}} label="Filter by licence status">
      <SegmentedControlItem value="all" label="All" />
      <SegmentedControlItem value="verified" label="Verified" isDisabled />
      <SegmentedControlItem value="review" label="Under review" />
      <SegmentedControlItem value="none" label="Not submitted" />
    </SegmentedControl>
    <Text type="supporting">No shop is verified yet, so that filter would come back empty.</Text>
  </VStack>
);

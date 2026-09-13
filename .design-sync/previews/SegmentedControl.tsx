import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

/**
 * Shop type — three mutually exclusive modes, all worth seeing at once. This
 * is an input that changes a value, not navigation; a TabList would be wrong.
 */
export const ShopType = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Text type="label">Shop type</Text>
    <SegmentedControl value="full" onChange={() => {}} label="Shop type">
      <SegmentedControlItem value="full" label="Full store" />
      <SegmentedControlItem value="stock" label="Stock only" />
      <SegmentedControlItem value="ads" label="Advertising only" />
    </SegmentedControl>
  </VStack>
);

/**
 * The licence filter above the shops table. Four options is the practical
 * ceiling before a Selector reads better.
 */
export const LicenceFilter = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Text type="label">Trading licence</Text>
    <SegmentedControl value="review" onChange={() => {}} label="Filter by licence status">
      <SegmentedControlItem value="all" label="All" />
      <SegmentedControlItem value="verified" label="Verified" />
      <SegmentedControlItem value="review" label="Under review" />
      <SegmentedControlItem value="none" label="Not submitted" />
    </SegmentedControl>
  </VStack>
);

/** Sizes. `lg` is the one a shop owner taps on a phone in the sun. */
export const Sizes = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <SegmentedControl size="sm" value="today" onChange={() => {}} label="Period">
      <SegmentedControlItem value="today" label="Today" />
      <SegmentedControlItem value="week" label="This week" />
      <SegmentedControlItem value="month" label="This month" />
    </SegmentedControl>
    <SegmentedControl size="md" value="week" onChange={() => {}} label="Period">
      <SegmentedControlItem value="today" label="Today" />
      <SegmentedControlItem value="week" label="This week" />
      <SegmentedControlItem value="month" label="This month" />
    </SegmentedControl>
    <SegmentedControl size="lg" value="month" onChange={() => {}} label="Period">
      <SegmentedControlItem value="today" label="Today" />
      <SegmentedControlItem value="week" label="This week" />
      <SegmentedControlItem value="month" label="This month" />
    </SegmentedControl>
  </VStack>
);

/**
 * `hug` sizes each segment to its own label; `fill` splits the container
 * evenly, which is what a full-width phone toolbar wants.
 */
export const HugVersusFill = () => (
  <VStack gap={5} style={{width: 340}}>
    <VStack gap={2} style={{alignItems: 'flex-start'}}>
      <Text type="label">hug — sized to the words</Text>
      <SegmentedControl value="cash" onChange={() => {}} label="Payment" layout="hug">
        <SegmentedControlItem value="cash" label="Cash" />
        <SegmentedControlItem value="account" label="On the book" />
      </SegmentedControl>
    </VStack>
    <VStack gap={2}>
      <Text type="label">fill — split the row evenly</Text>
      <SegmentedControl value="cash" onChange={() => {}} label="Payment" layout="fill">
        <SegmentedControlItem value="cash" label="Cash" />
        <SegmentedControlItem value="account" label="On the book" />
      </SegmentedControl>
    </VStack>
  </VStack>
);

/**
 * The whole group off, with the reason attached. `disabledMessage` is the
 * supported way to explain it — a wrapping Tooltip never sees the hover.
 */
export const WholeGroupDisabled = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Text type="label">Shop type</Text>
    <SegmentedControl
      value="full"
      onChange={() => {}}
      label="Shop type"
      isDisabled
      disabledMessage="You can change this once your trading licence is verified"
    >
      <SegmentedControlItem value="full" label="Full store" />
      <SegmentedControlItem value="stock" label="Stock only" />
      <SegmentedControlItem value="ads" label="Advertising only" />
    </SegmentedControl>
  </VStack>
);

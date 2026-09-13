import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

/** Choosing a licence status when filtering the shops list — one selected. */
export const LicenceFilter = () => (
  <HStack gap={3} style={{flexWrap: 'wrap'}}>
    <SelectableCard label="Verified" isSelected width={170}>
      <Text weight="semibold">Verified</Text>
    </SelectableCard>
    <SelectableCard label="Under review" width={170}>
      <Text weight="semibold">Under review</Text>
    </SelectableCard>
    <SelectableCard label="Not submitted" width={170}>
      <Text weight="semibold">Not submitted</Text>
    </SelectableCard>
  </HStack>
);

/** Step 1 of "Add a shop" — pick how the shop will trade, with detail per option. */
export const ShopTypePicker = () => (
  <HStack gap={3} style={{flexWrap: 'wrap'}}>
    <SelectableCard label="Full store" isSelected width={200}>
      <VStack gap={1}>
        <Heading level={4}>Full store</Heading>
        <Text type="supporting">Sell products and take orders from customers nearby.</Text>
      </VStack>
    </SelectableCard>
    <SelectableCard label="Stock only" width={200}>
      <VStack gap={1}>
        <Heading level={4}>Stock only</Heading>
        <Text type="supporting">Track inventory without listing the shop for orders.</Text>
      </VStack>
    </SelectableCard>
    <SelectableCard label="Advertising only" isDisabled width={200}>
      <VStack gap={1}>
        <Heading level={4}>Advertising only</Heading>
        <Text type="supporting">Coming soon for this account.</Text>
      </VStack>
    </SelectableCard>
  </HStack>
);

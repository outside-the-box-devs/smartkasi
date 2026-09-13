import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Section} from '@astryxdesign/core/Section';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Button} from '@astryxdesign/core/Button';

/** Quick filters for the stock list — dismissible by scrim, swipe, or Escape. */
export const StockFilters = () => (
  <BottomSheet isOpen label="Filter stock" purpose="info" height="hug" onOpenChange={() => {}}>
    <Section padding={4}>
      <VStack gap={3}>
        <Heading level={3}>Filter stock</Heading>
        <HStack gap={2} style={{flexWrap: 'wrap'}}>
          <SelectableCard label="All products" isSelected width={140}>
            <Text weight="semibold">All products</Text>
          </SelectableCard>
          <SelectableCard label="Low stock" width={140}>
            <Text weight="semibold">Low stock</Text>
          </SelectableCard>
        </HStack>
      </VStack>
    </Section>
  </BottomSheet>
);

/** A restock form — protects entered quantities from an accidental scrim tap. */
export const RestockForm = () => (
  <BottomSheet isOpen label="Restock cooking oil" purpose="form" height="tall" onOpenChange={() => {}}>
    <Section padding={4}>
      <VStack gap={3}>
        <Heading level={3}>Restock cooking oil</Heading>
        <Text type="supporting">Sunfoil · 2 L — 3 left</Text>
        <Text type="body" color="secondary">
          Enter how many units arrived from your supplier today.
        </Text>
        <Button variant="primary" label="Save new stock count" />
      </VStack>
    </Section>
  </BottomSheet>
);

/** A licence upload the owner must complete before the sheet can close. */
export const RequiredLicenceUpload = () => (
  <BottomSheet isOpen label="Upload trading licence" purpose="required" height="capped" onOpenChange={() => {}}>
    <Section padding={4}>
      <VStack gap={3}>
        <Heading level={3}>Upload your trading licence</Heading>
        <Text type="body" color="secondary">
          Required before Thoko&apos;s Spaza can accept orders from customers
          nearby. This can&apos;t be dismissed until it&apos;s submitted.
        </Text>
        <Button variant="primary" label="Choose a file" />
      </VStack>
    </Section>
  </BottomSheet>
);

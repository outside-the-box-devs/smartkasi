import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

/** Each shop card navigates to its detail page — the whole surface is one target. */
export const ShopNavigationGrid = () => (
  <HStack gap={4} style={{flexWrap: 'wrap'}}>
    <ClickableCard label="Open Thoko's Spaza" href="#" width={220}>
      <VStack gap={1}>
        <Heading level={4}>Thoko&apos;s Spaza</Heading>
        <Text color="secondary">Orlando East</Text>
        <Badge variant="success" label="Verified" />
      </VStack>
    </ClickableCard>
    <ClickableCard label="Open Kasi Corner Store" href="#" width={220}>
      <VStack gap={1}>
        <Heading level={4}>Kasi Corner Store</Heading>
        <Text color="secondary">Diepkloof</Text>
        <Badge variant="warning" label="Under review" />
      </VStack>
    </ClickableCard>
  </HStack>
);

/** A product tile that opens its stock detail — price and quantity at a glance. */
export const ProductTile = () => (
  <ClickableCard label="View maize meal stock detail" href="#" width={240} elevation="low">
    <VStack gap={1}>
      <Text weight="semibold">Maize meal</Text>
      <Text type="supporting">Iwisa · 10 kg</Text>
      <Text hasTabularNumbers weight="semibold">
        R 109.99
      </Text>
    </VStack>
  </ClickableCard>
);

/** Discontinued lines stay visible but aren't navigable. */
export const DisabledProductTile = () => (
  <ClickableCard label="Paraffin — discontinued" href="#" width={240} isDisabled>
    <VStack gap={1}>
      <Text weight="semibold" color="disabled">
        Paraffin
      </Text>
      <Text type="supporting" color="disabled">
        Blue · 1 L — discontinued
      </Text>
    </VStack>
  </ClickableCard>
);

import {Badge} from '@astryxdesign/core/Badge';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

/** Trading-licence state on a shop — the semantic variants, used sparingly. */
export const LicenceStatus = () => (
  <HStack gap={3}>
    <Badge variant="success" label="Verified" />
    <Badge variant="warning" label="Under review" />
    <Badge variant="neutral" label="Not submitted" />
  </HStack>
);

/** Where an order leg has got to. Only the states an owner must act on are loud. */
export const OrderStages = () => (
  <HStack gap={3}>
    <Badge variant="warning" label="Pending" />
    <Badge variant="info" label="Accepted" />
    <Badge variant="success" label="Ready" />
    <Badge variant="error" label="Rejected" />
  </HStack>
);

/** Non-semantic colours classify rather than alarm: shop type, product aisle. */
export const CategoryTags = () => (
  <HStack gap={3}>
    <Badge variant="teal" label="Full store" />
    <Badge variant="blue" label="Stock only" />
    <Badge variant="purple" label="Advertising only" />
    <Badge variant="orange" label="Cold drinks" />
  </HStack>
);

/** Counts, next to the thing being counted. */
export const Counts = () => (
  <VStack gap={3}>
    <HStack gap={2}>
      <Text>Items running low</Text>
      <Badge variant="warning" label="7" />
    </HStack>
    <HStack gap={2}>
      <Text>Orders waiting</Text>
      <Badge variant="error" label="3" />
    </HStack>
  </VStack>
);

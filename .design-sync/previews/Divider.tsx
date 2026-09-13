import {Divider} from '@astryxdesign/core/Divider';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

/** The default: a subtle rule closing off the items before the total. */
export const ReceiptTotal = () => (
  <Card padding={3} width={300}>
    <VStack gap={2}>
      <Heading level={5}>Sale 0087</Heading>
      <HStack hAlign="between">
        <Text type="supporting">Brown bread × 2</Text>
        <Text type="supporting" hasTabularNumbers>
          R 37.98
        </Text>
      </HStack>
      <HStack hAlign="between">
        <Text type="supporting">Cooking oil × 1</Text>
        <Text type="supporting" hasTabularNumbers>
          R 74.50
        </Text>
      </HStack>
      <Divider />
      <HStack hAlign="between" vAlign="center">
        <Text type="label">Total</Text>
        <Text type="large" weight="semibold" hasTabularNumbers>
          R 112.48
        </Text>
      </HStack>
      <Divider variant="strong" />
      <HStack hAlign="between" vAlign="center">
        <Text type="label">Change to give</Text>
        <Text weight="semibold" hasTabularNumbers>
          R 37.52
        </Text>
      </HStack>
    </VStack>
  </Card>
);

/** subtle versus strong, on the same card so the weight difference reads. */
export const Weights = () => (
  <Card padding={3} width={320}>
    <VStack gap={3}>
      <Text type="supporting">variant=&quot;subtle&quot; (default)</Text>
      <Divider />
      <Text type="supporting">variant=&quot;strong&quot;</Text>
      <Divider variant="strong" />
      <Text type="supporting">back to subtle</Text>
      <Divider />
    </VStack>
  </Card>
);

/** A label turns the rule into a quiet category heading between groups. */
export const LabelledGroups = () => (
  <Card padding={3} width={320}>
    <VStack gap={2}>
      <Divider label="Groceries" />
      <Text>Maize meal — Iwisa 10 kg</Text>
      <Text>Brown bread — Albany 700 g</Text>
      <Divider label="Household" />
      <Text>Paraffin — Blue 1 L</Text>
      <Text>Candles — pack of 6</Text>
      <Divider label="Airtime" />
      <Text>MTN R5 voucher</Text>
    </VStack>
  </Card>
);

/**
 * `orientation="vertical"` splits a row. The stack needs a height for the
 * rule to have something to draw against.
 */
export const VerticalSplit = () => (
  <Card padding={3} width={420}>
    <HStack gap={4} vAlign="center" height={64}>
      <VStack gap={0.5}>
        <Text type="supporting">Takings today</Text>
        <Text weight="semibold" hasTabularNumbers>
          R 4 820.50
        </Text>
      </VStack>
      <Divider orientation="vertical" />
      <VStack gap={0.5}>
        <Text type="supporting">Sales</Text>
        <Text weight="semibold" hasTabularNumbers>
          37
        </Text>
      </VStack>
      <Divider orientation="vertical" />
      <VStack gap={0.5}>
        <Text type="supporting">Low stock</Text>
        <HStack gap={2} vAlign="center">
          <Text weight="semibold" hasTabularNumbers>
            7
          </Text>
          <Badge variant="warning" label="Reorder" />
        </HStack>
      </VStack>
    </HStack>
  </Card>
);

/** `isFullBleed` pushes the rule past the card padding to the container edge. */
export const FullBleed = () => (
  <Card padding={3} width={320}>
    <VStack gap={2}>
      <Heading level={5}>Orders waiting</Heading>
      <Divider isFullBleed />
      <Text>Order 1042 — Kasi Corner Store</Text>
      <Divider isFullBleed />
      <Text>Order 1043 — Mama Ndlovu Tuck Shop</Text>
      <Divider isFullBleed />
      <Text>Order 1044 — Zola Fresh Produce</Text>
    </VStack>
  </Card>
);

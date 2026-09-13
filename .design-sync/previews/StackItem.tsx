import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Divider} from '@astryxdesign/core/Divider';

/**
 * StackItem only means something inside a Stack. `size="fill"` is the whole
 * point: the order number and the action keep their intrinsic width, and the
 * shop details swallow whatever is left over.
 */
export const FillTheMiddle = () => (
  <Card padding={3} width={420}>
    <HStack gap={3} vAlign="center">
      <StackItem size="static">
        <Badge variant="teal" label="Order 1042" />
      </StackItem>
      <StackItem size="fill">
        <VStack gap={0.5}>
          <Heading level={5}>Kasi Corner Store</Heading>
          <Text type="supporting">Diepkloof · 4 items · R 312.75</Text>
        </VStack>
      </StackItem>
      <StackItem size="static">
        <Button label="Accept" variant="primary" size="sm" />
      </StackItem>
    </HStack>
  </Card>
);

/**
 * `static` (the default) versus `fill`, on the same row. With every item
 * static the price sits mid-row; making the middle item fill pushes it to the
 * end of the card without a spacer.
 */
export const SizeComparison = () => (
  <VStack gap={4} width={420}>
    <VStack gap={1}>
      <Text type="supporting">every item size=&quot;static&quot;</Text>
      <Card padding={3}>
        <HStack gap={3} vAlign="center">
          <StackItem size="static">
            <Text weight="semibold">Maize meal</Text>
          </StackItem>
          <StackItem size="static">
            <Text type="supporting">Iwisa · 10 kg</Text>
          </StackItem>
          <StackItem size="static">
            <Text hasTabularNumbers>R 109.99</Text>
          </StackItem>
        </HStack>
      </Card>
    </VStack>

    <VStack gap={1}>
      <Text type="supporting">middle item size=&quot;fill&quot;</Text>
      <Card padding={3}>
        <HStack gap={3} vAlign="center">
          <StackItem size="static">
            <Text weight="semibold">Maize meal</Text>
          </StackItem>
          <StackItem size="fill">
            <Text type="supporting">Iwisa · 10 kg</Text>
          </StackItem>
          <StackItem size="static">
            <Text hasTabularNumbers>R 109.99</Text>
          </StackItem>
        </HStack>
      </Card>
    </VStack>
  </VStack>
);

/**
 * `crossAlignSelf` overrides the stack's alignment for one child — the licence
 * chip pins to the top of a row whose other content is vertically centred.
 */
export const CrossAlignSelf = () => (
  <Card padding={3} width={400}>
    <HStack gap={3} vAlign="center">
      <StackItem size="fill">
        <VStack gap={1}>
          <Heading level={5}>Thoko&apos;s Spaza</Heading>
          <Text type="supporting">
            Orlando East · open 06:00 to 20:00, seven days a week
          </Text>
          <HStack gap={2} vAlign="center">
            <StatusDot variant="success" label="Taking orders" />
            <Text type="supporting">Taking orders</Text>
          </HStack>
        </VStack>
      </StackItem>
      <StackItem size="static" crossAlignSelf="start">
        <Badge variant="success" label="Verified" />
      </StackItem>
    </HStack>
  </Card>
);

/**
 * `<StackItem size="fill" isScrollable>` is a complete scroll region: it grows
 * to fill the stack and applies the flex min-height reset itself, so the
 * low-stock list scrolls while the heading and the total stay put.
 */
export const ScrollRegion = () => (
  <Card padding={0} width={300}>
    <VStack height={260}>
      <StackItem size="static">
        <VStack padding={3} gap={0.5}>
          <Heading level={5}>Items running low</Heading>
          <Text type="supporting">Reorder before the weekend</Text>
        </VStack>
      </StackItem>
      <StackItem size="static">
        <Divider />
      </StackItem>
      <StackItem size="fill" isScrollable>
        <VStack gap={2} padding={3}>
          {[
            ['Cooking oil — Sunfoil 2 L', '3 left'],
            ['Paraffin — Blue 1 L', '2 left'],
            ['Sugar — Selati 2 kg', '4 left'],
            ['Candles — pack of 6', '1 left'],
            ['Matches — box', '5 left'],
            ['Brown bread — Albany 700 g', '6 left'],
          ].map(([name, qty]) => (
            <HStack key={name} gap={3} hAlign="between" vAlign="center">
              <Text>{name}</Text>
              <Text type="supporting" hasTabularNumbers>
                {qty}
              </Text>
            </HStack>
          ))}
        </VStack>
      </StackItem>
      <StackItem size="static">
        <Divider />
      </StackItem>
      <StackItem size="static">
        <HStack padding={3} hAlign="between" vAlign="center">
          <Text type="label">To reorder</Text>
          <Text weight="semibold" hasTabularNumbers>
            R 1 284.00
          </Text>
        </HStack>
      </StackItem>
    </VStack>
  </Card>
);

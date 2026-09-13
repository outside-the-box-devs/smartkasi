import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';

/**
 * The default page rhythm: heading, supporting line, then the content. One
 * `gap` on the stack instead of a margin on every child.
 */
export const PageSection = () => (
  <VStack gap={3} width={380}>
    <Heading level={3}>Stock on hand</Heading>
    <Text color="secondary">
      Counts update as you ring up sales, even with no signal.
    </Text>
    <Card padding={3}>
      <VStack gap={2}>
        <HStack hAlign="between">
          <Text>Maize meal — Iwisa 10 kg</Text>
          <Text hasTabularNumbers>24</Text>
        </HStack>
        <HStack hAlign="between">
          <Text>Brown bread — Albany 700 g</Text>
          <Text hasTabularNumbers>11</Text>
        </HStack>
        <HStack hAlign="between">
          <Text>Cooking oil — Sunfoil 2 L</Text>
          <Text hasTabularNumbers>3</Text>
        </HStack>
      </VStack>
    </Card>
  </VStack>
);

/**
 * On a vertical stack `hAlign` is the cross axis. `stretch` (the default) makes
 * every child full width — that is what lets the buttons below span the card.
 */
export const CrossAxisAlignment = () => (
  <HStack gap={4} vAlign="start">
    <VStack gap={1}>
      <Text type="supporting">hAlign=&quot;stretch&quot; (default)</Text>
      <Card padding={3} width={190}>
        <VStack gap={2}>
          <Button label="Ring up a sale" variant="primary" />
          <Button label="Add stock" />
        </VStack>
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">hAlign=&quot;center&quot;</Text>
      <Card padding={3} width={190}>
        <VStack gap={2} hAlign="center">
          <Text type="display-3" hasTabularNumbers>
            R 4 820
          </Text>
          <Text type="supporting">Taken today</Text>
        </VStack>
      </Card>
    </VStack>
  </HStack>
);

/**
 * `vAlign` is the main axis here: with a fixed height, `between` pins the
 * total to the bottom of the receipt without a spacer element.
 */
export const MainAxisDistribution = () => (
  <Card padding={3} width={260} height={210}>
    <VStack vAlign="between" height="100%">
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
      </VStack>
      <VStack gap={2}>
        <Divider />
        <HStack hAlign="between" vAlign="center">
          <Text type="label">Total</Text>
          <Text type="large" weight="semibold" hasTabularNumbers>
            R 112.48
          </Text>
        </HStack>
      </VStack>
    </VStack>
  </Card>
);

/** The same gap step reads differently at each size — pick one per region. */
export const GapScale = () => (
  <HStack gap={4} vAlign="start">
    {([1, 3, 6] as const).map((step) => (
      <VStack key={step} gap={1}>
        <Text type="supporting">gap={step}</Text>
        <Card padding={3} width={130}>
          <VStack gap={step}>
            <Badge variant="warning" label="Pending" />
            <Badge variant="info" label="Accepted" />
            <Badge variant="success" label="Ready" />
          </VStack>
        </Card>
      </VStack>
    ))}
  </HStack>
);

/** A fixed height plus `isScrollable` turns a column into its own scroll area. */
export const ScrollableColumn = () => (
  <Card padding={0} width={280}>
    <VStack gap={2} padding={3} height={180} isScrollable>
      <Text type="label">Today&apos;s sales</Text>
      {[
        ['09:12', 'R 37.98'],
        ['09:40', 'R 112.48'],
        ['10:05', 'R 18.99'],
        ['10:31', 'R 219.00'],
        ['11:02', 'R 74.50'],
        ['11:48', 'R 9.50'],
        ['12:15', 'R 154.20'],
      ].map(([time, amount]) => (
        <HStack key={time} hAlign="between">
          <Text type="supporting">{time}</Text>
          <Text hasTabularNumbers>{amount}</Text>
        </HStack>
      ))}
    </VStack>
  </Card>
);

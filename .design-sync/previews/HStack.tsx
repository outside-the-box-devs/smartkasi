import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';

/** The everyday row: what it is on the left, what to do about it on the right. */
export const ToolbarRow = () => (
  <Card padding={3} width={420}>
    <HStack gap={3} hAlign="between" vAlign="center">
      <VStack gap={0.5}>
        <Heading level={5}>Orders waiting</Heading>
        <Text type="supporting">Oldest has been open 12 minutes</Text>
      </VStack>
      <HStack gap={2} vAlign="center">
        <Badge variant="error" label="3" />
        <Button label="Review" variant="primary" size="sm" />
      </HStack>
    </HStack>
  </Card>
);

/**
 * `vAlign` is the cross axis on a horizontal stack. `center` is right for a
 * dot beside one line of text; `start` is right when one column is taller.
 */
export const CrossAxisAlignment = () => (
  <VStack gap={4} width={400}>
    <VStack gap={1}>
      <Text type="supporting">vAlign=&quot;center&quot;</Text>
      <Card padding={3}>
        <HStack gap={2} vAlign="center">
          <StatusDot variant="success" label="Open" />
          <Text>Thoko&apos;s Spaza is open and taking orders</Text>
        </HStack>
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">vAlign=&quot;start&quot;</Text>
      <Card padding={3}>
        <HStack gap={3} vAlign="start">
          <Badge variant="warning" label="Low" />
          <VStack gap={0.5}>
            <Text weight="semibold">Cooking oil — Sunfoil 2 L</Text>
            <Text type="supporting">
              3 bottles left. You usually sell eight a week, so order before
              Friday.
            </Text>
          </VStack>
        </HStack>
      </Card>
    </VStack>
  </VStack>
);

/**
 * `hAlign` is the main axis: `between` pushes the ends apart, `evenly` gives
 * each stat the same share of the row.
 */
export const MainAxisDistribution = () => (
  <VStack gap={4} width={400}>
    <VStack gap={1}>
      <Text type="supporting">hAlign=&quot;between&quot;</Text>
      <Card padding={3}>
        <HStack hAlign="between" vAlign="center">
          <Text type="label">Change to give</Text>
          <Text type="large" weight="semibold" hasTabularNumbers>
            R 19.50
          </Text>
        </HStack>
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">hAlign=&quot;evenly&quot;</Text>
      <Card padding={3}>
        <HStack hAlign="evenly" vAlign="center">
          {[
            ['Sales', '37'],
            ['Takings', 'R 4 820'],
            ['Low stock', '7'],
          ].map(([label, value]) => (
            <VStack key={label} gap={0.5} hAlign="center">
              <Text weight="semibold" hasTabularNumbers>
                {value}
              </Text>
              <Text type="supporting">{label}</Text>
            </VStack>
          ))}
        </HStack>
      </Card>
    </VStack>
  </VStack>
);

/** Wrap rather than nest: the filter chips drop to a second line when narrow. */
export const WrappingChips = () => (
  <VStack gap={2} width={310}>
    <Text type="label">Filter shops</Text>
    <HStack gap={2} wrap="wrap">
      {['Orlando East', 'Diepkloof', 'Meadowlands', 'Zola', 'Pimville'].map(
        (area) => (
          <Card key={area} padding={2} variant="muted">
            <Text>{area}</Text>
          </Card>
        ),
      )}
    </HStack>
  </VStack>
);

/** One `StackItem size="fill"` in the middle keeps both ends anchored. */
export const FillTheMiddle = () => (
  <Card padding={3} width={420}>
    <HStack gap={3} vAlign="center">
      <StackItem size="static">
        <Badge variant="teal" label="Order 1042" />
      </StackItem>
      <StackItem size="fill">
        <Text type="supporting">Kasi Corner Store · 4 items</Text>
      </StackItem>
      <StackItem size="static">
        <Text weight="semibold" hasTabularNumbers>
          R 312.75
        </Text>
      </StackItem>
    </HStack>
  </Card>
);

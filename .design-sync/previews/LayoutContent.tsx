import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {List, ListItem} from '@astryxdesign/core/List';

const sales = [
  ['09:12', 'Brown bread × 2', 'R 37.98'],
  ['09:40', 'Cooking oil × 1', 'R 74.50'],
  ['10:05', 'Airtime R5 × 3', 'R 15.00'],
  ['10:31', 'Maize meal × 2', 'R 219.98'],
  ['11:02', 'Paraffin × 1', 'R 32.00'],
  ['11:48', 'Candles × 1', 'R 9.50'],
];

const SalesList = () => (
  <List density="compact" hasDividers>
    {sales.map(([time, what, amount]) => (
      <ListItem
        key={time}
        label={what}
        description={time}
        endContent={<Text hasTabularNumbers>{amount}</Text>}
      />
    ))}
  </List>
);

/**
 * LayoutContent is the centre slot, and it scrolls by default — that is what
 * keeps the header and footer fixed while the day's sales run past them.
 */
export const ScrollingCentre = () => (
  <Card padding={0} width={440} height={280}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Today’s sales</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <SalesList />
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack hAlign="between" vAlign="center">
            <Text type="label">Takings</Text>
            <Text weight="semibold" hasTabularNumbers>
              R 4 820.50
            </Text>
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/**
 * `padding` overrides whatever the Layout set. `0` is right when the content
 * is a list or table that should run to the edge; `4` for prose and forms.
 */
export const PaddingOverride = () => (
  <HStack gap={4} vAlign="start">
    <VStack gap={1}>
      <Text type="supporting">padding=&#123;0&#125; — list to the edge</Text>
      <Card padding={0} width={260} height={200}>
        <Layout
          padding={4}
          header={
            <LayoutHeader hasDivider>
              <Heading level={5}>Sales</Heading>
            </LayoutHeader>
          }
          content={
            <LayoutContent padding={0}>
              <SalesList />
            </LayoutContent>
          }
        />
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">padding=&#123;4&#125; — prose</Text>
      <Card padding={0} width={260} height={200}>
        <Layout
          header={
            <LayoutHeader hasDivider>
              <Heading level={5}>Working offline</Heading>
            </LayoutHeader>
          }
          content={
            <LayoutContent padding={4}>
              <Text color="secondary">
                Every sale is saved on this phone first. SmartKasi sends them
                when you have signal, so the till never stops.
              </Text>
            </LayoutContent>
          }
        />
      </Card>
    </VStack>
  </HStack>
);

/**
 * `isScrollable={false}` clips instead of scrolling — for a till screen where
 * a hidden row below the fold would be a miscounted sale.
 */
export const NonScrolling = () => (
  <Card padding={0} width={420} height={220}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Ring up a sale</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent isScrollable={false}>
          <VStack gap={2}>
            <HStack hAlign="between">
              <Text>Brown bread × 2</Text>
              <Text hasTabularNumbers>R 37.98</Text>
            </HStack>
            <HStack hAlign="between">
              <Text>Cooking oil × 1</Text>
              <Text hasTabularNumbers>R 74.50</Text>
            </HStack>
            <HStack hAlign="between" vAlign="center">
              <Text type="label">Change to give</Text>
              <Text type="large" weight="semibold" hasTabularNumbers>
                R 37.52
              </Text>
            </HStack>
          </VStack>
        </LayoutContent>
      }
    />
  </Card>
);

/** `label` and `role` name the region for a screen reader. */
export const LandmarkRegion = () => (
  <Card padding={0} width={420} height={200}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <Heading level={4}>Orders</Heading>
            <Badge variant="error" label="3" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent role="region" label="Order queue">
          <VStack gap={2}>
            <Text>Order 1042 — Kasi Corner Store, Diepkloof</Text>
            <Text>Order 1043 — Mama Ndlovu Tuck Shop, Meadowlands</Text>
            <Text>Order 1044 — Zola Fresh Produce, Zola</Text>
          </VStack>
        </LayoutContent>
      }
    />
  </Card>
);

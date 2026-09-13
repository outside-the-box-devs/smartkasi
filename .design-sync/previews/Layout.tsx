import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {List, ListItem} from '@astryxdesign/core/List';

const stock = [
  ['Maize meal', 'Iwisa · 10 kg', 'R 109.99', '24 in stock'],
  ['Brown bread', 'Albany · 700 g', 'R 18.99', '11 in stock'],
  ['Cooking oil', 'Sunfoil · 2 L', 'R 74.50', '3 left'],
  ['Paraffin', 'Blue · 1 L', 'R 32.00', '2 left'],
];

const StockList = () => (
  <List density="balanced" hasDividers>
    {stock.map(([product, detail, price, qty]) => (
      <ListItem
        key={product}
        label={product}
        description={`${detail} · ${price}`}
        endContent={<Text type="supporting">{qty}</Text>}
      />
    ))}
  </List>
);

/**
 * The three stacked slots — header, content, footer — inside a fixed-height
 * frame. The content area scrolls on its own; the header and footer do not.
 */
export const HeaderContentFooter = () => (
  <Card padding={0} width={460} height={300}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <Heading level={4}>Stock on hand</Heading>
            <Button label="Add product" variant="primary" size="sm" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <StockList />
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <Text type="supporting">4 products · 2 running low</Text>
            <Badge variant="warning" label="Reorder" />
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/**
 * `start` and `end` are the side panels. This is the shape of the shop page:
 * a nav column, the stock list, and an order queue on the end.
 */
export const WithSidePanels = () => (
  <Card padding={0} width={620} height={280}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <Heading level={4}>Thoko’s Spaza</Heading>
            <Badge variant="success" label="Verified" />
          </HStack>
        </LayoutHeader>
      }
      start={
        <LayoutPanel width={150} hasDivider>
          <VStack gap={2}>
            <Text type="label">Shop</Text>
            <Text color="accent">Till</Text>
            <Text color="secondary">Stock</Text>
            <Text color="secondary">Orders</Text>
            <Text color="secondary">Takings</Text>
          </VStack>
        </LayoutPanel>
      }
      content={
        <LayoutContent>
          <StockList />
        </LayoutContent>
      }
      end={
        <LayoutPanel width={160} hasDivider>
          <VStack gap={2}>
            <Text type="label">Orders waiting</Text>
            {[
              ['1042', 'warning', 'Pending'],
              ['1043', 'info', 'Accepted'],
              ['1044', 'success', 'Ready'],
            ].map(([id, variant, stage]) => (
              <HStack key={id} gap={2} vAlign="center">
                <StatusDot
                  variant={variant as 'warning' | 'info' | 'success'}
                  label={stage}
                />
                <Text type="supporting">
                  {id} · {stage}
                </Text>
              </HStack>
            ))}
          </VStack>
        </LayoutPanel>
      }
    />
  </Card>
);

/**
 * `contentWidth` caps the measure inside every slot and centres it, while the
 * dividers stay full-bleed. Right for a settings or licence form.
 */
export const CappedContentWidth = () => (
  <Card padding={0} width={520} height={280}>
    <Layout
      contentWidth={320}
      defaultHasDividers
      header={
        <LayoutHeader>
          <Heading level={4}>Verify your licence</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={3}>
            <Text color="secondary">
              Send a photo of your trading licence. We check it with the
              municipality — it usually takes two working days.
            </Text>
            <Card padding={3} variant="muted">
              <VStack gap={1}>
                <Text type="label">Current state</Text>
                <Badge variant="warning" label="Under review" />
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter>
          <HStack gap={2} hAlign="end">
            <Button label="Send photo" variant="primary" size="sm" />
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/**
 * `height="auto"` lets the shell grow with its content instead of filling a
 * frame — the right mode for a page that scrolls as a whole.
 */
export const AutoHeight = () => (
  <Card padding={0} width={420}>
    <Layout
      height="auto"
      padding={0}
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Today’s takings</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={2}>
            <Text type="display-3" hasTabularNumbers>
              R 4 820.50
            </Text>
            <Text color="secondary">37 sales, all cash</Text>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <Text type="supporting">Counted at 18:04 · saved on this phone</Text>
        </LayoutFooter>
      }
    />
  </Card>
);

import {Layout, LayoutHeader, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const StockBody = () => (
  <LayoutContent>
    <VStack gap={2}>
      <HStack hAlign="between">
        <Text>Maize meal — Iwisa 10 kg</Text>
        <Text hasTabularNumbers>24</Text>
      </HStack>
      <HStack hAlign="between">
        <Text>Cooking oil — Sunfoil 2 L</Text>
        <Text hasTabularNumbers>3</Text>
      </HStack>
      <HStack hAlign="between">
        <Text>Brown bread — Albany 700 g</Text>
        <Text hasTabularNumbers>11</Text>
      </HStack>
    </VStack>
  </LayoutContent>
);

/**
 * `start` is the left panel — the shop's own tab bar, always visible while the
 * centre content scrolls. This is the shape of the shop page.
 */
export const StartNavPanel = () => (
  <Card padding={0} width={520} height={260}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <Heading level={4}>Thoko&apos;s Spaza</Heading>
            <Badge variant="success" label="Verified" />
          </HStack>
        </LayoutHeader>
      }
      start={
        <LayoutPanel width={140} hasDivider>
          <VStack gap={2}>
            <Text type="label">Shop</Text>
            <Text color="accent">Stock</Text>
            <Text color="secondary">Sell</Text>
            <Text color="secondary">Licence</Text>
            <Text color="secondary">Flyers</Text>
          </VStack>
        </LayoutPanel>
      }
      content={<StockBody />}
    />
  </Card>
);

/**
 * `end` is the right panel — a queue the owner glances at without leaving the
 * stock list. Order legs are dots plus text, never colour alone.
 */
export const EndOrderQueuePanel = () => (
  <Card padding={0} width={540} height={260}>
    <Layout
      header={<LayoutHeader hasDivider><Heading level={4}>Stock on hand</Heading></LayoutHeader>}
      content={<StockBody />}
      end={
        <LayoutPanel width={170} hasDivider>
          <VStack gap={2}>
            <Text type="label">Orders waiting</Text>
            {[
              ['1042', 'warning', 'Pending'],
              ['1043', 'info', 'Accepted'],
              ['1044', 'success', 'Ready'],
            ].map(([id, variant, stage]) => (
              <HStack key={id} gap={2} vAlign="center">
                <StatusDot variant={variant as 'warning' | 'info' | 'success'} label={stage} />
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

/** `hasDivider` separates the panel from the content beside it. */
export const DividerToggle = () => (
  <HStack gap={4} vAlign="start">
    <VStack gap={1}>
      <Text type="supporting">hasDivider (recommended)</Text>
      <Card padding={0} width={300} height={200}>
        <Layout
          start={<LayoutPanel width={110} hasDivider><Text type="label">Menu</Text></LayoutPanel>}
          content={<StockBody />}
        />
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">hasDivider=&#123;false&#125; (default)</Text>
      <Card padding={0} width={300} height={200}>
        <Layout
          start={<LayoutPanel width={110}><Text type="label">Menu</Text></LayoutPanel>}
          content={<StockBody />}
        />
      </Card>
    </VStack>
  </HStack>
);

/**
 * `isScrollable={false}` clips a panel instead of scrolling it — right for a
 * short fixed list like this order queue, where a scrollbar would be noise.
 */
export const NonScrollingPanel = () => (
  <Card padding={0} width={480} height={220}>
    <Layout
      header={<LayoutHeader hasDivider><Heading level={4}>Ring up a sale</Heading></LayoutHeader>}
      content={<StockBody />}
      end={
        <LayoutPanel width={150} hasDivider isScrollable={false} padding={2}>
          <VStack gap={1}>
            <Text type="label">Cash only</Text>
            <Text type="supporting">No card reader on this device</Text>
          </VStack>
        </LayoutPanel>
      }
    />
  </Card>
);

/** `label` and `role` name the panel landmark for a screen reader. */
export const LandmarkPanel = () => (
  <Card padding={0} width={480} height={220}>
    <Layout
      header={<LayoutHeader hasDivider><Heading level={4}>Orders</Heading></LayoutHeader>}
      content={<StockBody />}
      end={
        <LayoutPanel width={160} hasDivider role="complementary" label="Order queue">
          <VStack gap={2}>
            <Text type="label">Waiting</Text>
            <Badge variant="warning" label="3" />
          </VStack>
        </LayoutPanel>
      }
    />
  </Card>
);

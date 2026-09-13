import {
  Layout,
  LayoutHeader,
  LayoutContent,
} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const Body = () => (
  <LayoutContent>
    <VStack gap={2}>
      <Text color="secondary">
        Counts update as you ring up sales, even with no signal.
      </Text>
      <HStack hAlign="between">
        <Text>Maize meal — Iwisa 10 kg</Text>
        <Text hasTabularNumbers>24</Text>
      </HStack>
      <HStack hAlign="between">
        <Text>Cooking oil — Sunfoil 2 L</Text>
        <Text hasTabularNumbers>3</Text>
      </HStack>
    </VStack>
  </LayoutContent>
);

/**
 * LayoutHeader only renders in a Layout's `header` slot. The page title and
 * its one primary action — nothing that needs to scroll.
 */
export const TitleAndAction = () => (
  <Card padding={0} width={440} height={200}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <Heading level={4}>Stock on hand</Heading>
            <Button label="Add product" variant="primary" size="sm" />
          </HStack>
        </LayoutHeader>
      }
      content={<Body />}
    />
  </Card>
);

/** `hasDivider` is the difference between a header and a floating title. */
export const DividerOnOff = () => (
  <VStack gap={4}>
    <VStack gap={1}>
      <Text type="supporting">hasDivider (recommended)</Text>
      <Card padding={0} width={400} height={140}>
        <Layout
          header={
            <LayoutHeader hasDivider>
              <Heading level={4}>Orders</Heading>
            </LayoutHeader>
          }
          content={<Body />}
        />
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">hasDivider=&#123;false&#125; (default)</Text>
      <Card padding={0} width={400} height={140}>
        <Layout
          header={
            <LayoutHeader>
              <Heading level={4}>Orders</Heading>
            </LayoutHeader>
          }
          content={<Body />}
        />
      </Card>
    </VStack>
  </VStack>
);

/**
 * A fixed `height` keeps every page header in the app the same depth, however
 * much lands inside it.
 */
export const FixedHeight = () => (
  <Card padding={0} width={440} height={220}>
    <Layout
      header={
        <LayoutHeader height={72} hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={4}>Thoko’s Spaza</Heading>
              <Text type="supporting">Orlando East · cash only</Text>
            </VStack>
            <Badge variant="success" label="Verified" />
          </HStack>
        </LayoutHeader>
      }
      content={<Body />}
    />
  </Card>
);

/**
 * `label` and `role` name the landmark for a screen reader — worth setting
 * when a page has more than one banner-like region.
 */
export const LandmarkHeader = () => (
  <Card padding={0} width={440} height={200}>
    <Layout
      header={
        <LayoutHeader hasDivider role="banner" label="Till status">
          <HStack gap={3} hAlign="between" vAlign="center">
            <HStack gap={2} vAlign="center">
              <StatusDot variant="warning" label="Working offline" />
              <Text weight="semibold">Working offline</Text>
            </HStack>
            <Text type="supporting">12 sales waiting to send</Text>
          </HStack>
        </LayoutHeader>
      }
      content={<Body />}
    />
  </Card>
);

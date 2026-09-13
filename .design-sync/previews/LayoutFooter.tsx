import {Layout, LayoutHeader, LayoutContent, LayoutFooter} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const Body = () => (
  <LayoutContent>
    <VStack gap={2}>
      <Text>Brown bread × 2</Text>
      <Text>Cooking oil × 1</Text>
      <Text>Airtime R5 × 3</Text>
    </VStack>
  </LayoutContent>
);

/**
 * LayoutFooter only renders in a Layout's `footer` slot. Here it carries the
 * one number the owner checks after every sale — nothing that scrolls away.
 */
export const TakingsBar = () => (
  <Card padding={0} width={420} height={220}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Ring up a sale</Heading>
        </LayoutHeader>
      }
      content={<Body />}
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <Text type="label">Total</Text>
            <Text type="large" weight="semibold" hasTabularNumbers>
              R 187.49
            </Text>
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/** A form footer: primary and ghost actions, aligned to the end. */
export const FormActions = () => (
  <Card padding={0} width={400} height={200}>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <Heading level={4}>Verify your licence</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <Text color="secondary">
            Send a photo of your trading licence. We check it with the
            municipality — it usually takes two working days.
          </Text>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <HStack gap={2} hAlign="end">
            <Button label="Cancel" variant="ghost" size="sm" />
            <Button label="Send photo" variant="primary" size="sm" />
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/** `hasDivider` is the difference between a footer and a floating status line. */
export const DividerOnOff = () => (
  <VStack gap={4}>
    <VStack gap={1}>
      <Text type="supporting">hasDivider (recommended)</Text>
      <Card padding={0} width={380} height={140}>
        <Layout
          header={<LayoutHeader hasDivider><Heading level={5}>Orders</Heading></LayoutHeader>}
          content={<Body />}
          footer={
            <LayoutFooter hasDivider>
              <Text type="supporting">3 orders waiting</Text>
            </LayoutFooter>
          }
        />
      </Card>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">hasDivider=&#123;false&#125; (default)</Text>
      <Card padding={0} width={380} height={140}>
        <Layout
          header={<LayoutHeader hasDivider><Heading level={5}>Orders</Heading></LayoutHeader>}
          content={<Body />}
          footer={
            <LayoutFooter>
              <Text type="supporting">3 orders waiting</Text>
            </LayoutFooter>
          }
        />
      </Card>
    </VStack>
  </VStack>
);

/** A fixed `height` keeps the till footer the same depth on every screen. */
export const FixedHeight = () => (
  <Card padding={0} width={420} height={240}>
    <Layout
      header={<LayoutHeader hasDivider><Heading level={4}>Ring up a sale</Heading></LayoutHeader>}
      content={<Body />}
      footer={
        <LayoutFooter height={64} hasDivider>
          <HStack gap={3} hAlign="between" vAlign="center">
            <HStack gap={2} vAlign="center">
              <StatusDot variant="warning" label="Working offline" />
              <Text weight="semibold">3 sales waiting to sync</Text>
            </HStack>
            <Badge variant="warning" label="3" />
          </HStack>
        </LayoutFooter>
      }
    />
  </Card>
);

/** `label` and `role` name the landmark for a screen reader. */
export const LandmarkFooter = () => (
  <Card padding={0} width={420} height={200}>
    <Layout
      header={<LayoutHeader hasDivider><Heading level={4}>Today&apos;s sales</Heading></LayoutHeader>}
      content={<Body />}
      footer={
        <LayoutFooter hasDivider role="contentinfo" label="Sync status">
          <Text type="supporting">Counted at 18:04 · saved on this phone</Text>
        </LayoutFooter>
      }
    />
  </Card>
);

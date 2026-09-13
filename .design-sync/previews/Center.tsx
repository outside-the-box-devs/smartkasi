import {Center} from '@astryxdesign/core/Center';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Badge} from '@astryxdesign/core/Badge';

/**
 * The both-axis default needs a height to centre against — that is the one
 * rule people miss. Here it holds the "no sales yet" state of the till.
 */
export const EmptyState = () => (
  <Card padding={0} width={400}>
    <Center height={200} padding={4}>
      <VStack gap={2} hAlign="center">
        <Heading level={4}>No sales yet today</Heading>
        <Text type="supporting">
          Ring up your first sale and it will show here straight away.
        </Text>
        <Button label="Ring up a sale" variant="primary" />
      </VStack>
    </Center>
  </Card>
);

/** A loading panel while the day's takings come back from the device store. */
export const LoadingPanel = () => (
  <Card padding={0} width={400}>
    <Center height={160}>
      <VStack gap={2} hAlign="center">
        <Spinner />
        <Text type="supporting">Adding up today’s sales…</Text>
      </VStack>
    </Center>
  </Card>
);

/**
 * `axis="horizontal"` centres across the width only, leaving vertical flow to
 * the stack around it — right for a sign-in card on a tall page.
 */
export const HorizontalOnly = () => (
  <Card padding={4} width={400} variant="muted">
    <Center axis="horizontal">
      <Card padding={4} width={260}>
        <VStack gap={2} hAlign="center">
          <Heading level={5}>Sign in to SmartKasi</Heading>
          <Text type="supporting">Use the phone number for your shop</Text>
          <Button label="Continue" variant="primary" width="100%" />
        </VStack>
      </Card>
    </Center>
  </Card>
);

/** The three axes side by side, each in a box tall enough to show the effect. */
export const Axes = () => (
  <HStack gap={3} vAlign="start">
    {(['both', 'horizontal', 'vertical'] as const).map((axis) => (
      <VStack key={axis} gap={1}>
        <Text type="supporting">axis=&quot;{axis}&quot;</Text>
        <Card padding={0} width={150}>
          <Center axis={axis} height={110} padding={2}>
            <Badge variant="teal" label="Order 1042" />
          </Center>
        </Card>
      </VStack>
    ))}
  </HStack>
);

/** `isInline` centres a small mark inside a line of text without breaking it. */
export const InlineMark = () => (
  <Card padding={3} width={400}>
    <Text>
      Cooking oil is down to three bottles{' '}
      <Center isInline>
        <Badge variant="warning" label="Low" />
      </Center>{' '}
      — order before Friday.
    </Text>
  </Card>
);

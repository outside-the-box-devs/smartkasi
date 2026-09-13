import {Stack, StackItem} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';

/**
 * One component, two directions. `direction="vertical"` is the default because
 * most of the dashboard reads top-to-bottom on a phone held upright.
 */
export const Directions = () => (
  <Stack gap={5}>
    <Stack gap={2}>
      <Text type="label">direction=&quot;vertical&quot; (default)</Text>
      <Stack gap={2} width={260}>
        <Card padding={2}>
          <Text>Maize meal — Iwisa 10 kg</Text>
        </Card>
        <Card padding={2}>
          <Text>Cooking oil — Sunfoil 2 L</Text>
        </Card>
        <Card padding={2}>
          <Text>Brown bread — Albany 700 g</Text>
        </Card>
      </Stack>
    </Stack>

    <Stack gap={2}>
      <Text type="label">direction=&quot;horizontal&quot;</Text>
      <Stack direction="horizontal" gap={2}>
        <Card padding={2}>
          <Text>Today</Text>
        </Card>
        <Card padding={2}>
          <Text>This week</Text>
        </Card>
        <Card padding={2}>
          <Text>This month</Text>
        </Card>
      </Stack>
    </Stack>
  </Stack>
);

/**
 * `gap` is a spacing-scale step, never a pixel value — so every row in the app
 * lands on the same rhythm no matter who wrote it.
 */
export const GapScale = () => (
  <Stack gap={4}>
    {([1, 2, 4, 6] as const).map((step) => (
      <Stack key={step} gap={1}>
        <Text type="supporting">gap={step}</Text>
        <Stack direction="horizontal" gap={step}>
          <Badge variant="success" label="Verified" />
          <Badge variant="warning" label="Under review" />
          <Badge variant="neutral" label="Not submitted" />
        </Stack>
      </Stack>
    ))}
  </Stack>
);

/**
 * `hAlign`/`vAlign` follow the direction: on a horizontal stack hAlign spreads
 * items along the row and vAlign centres them against each other.
 */
export const Alignment = () => (
  <Stack gap={4} width={420}>
    <Stack gap={1}>
      <Text type="supporting">hAlign=&quot;between&quot;, vAlign=&quot;center&quot;</Text>
      <Card padding={3}>
        <Stack direction="horizontal" hAlign="between" vAlign="center">
          <Stack gap={0.5}>
            <Text weight="semibold">Thoko&apos;s Spaza</Text>
            <Text type="supporting">Orlando East</Text>
          </Stack>
          <Button label="Open till" variant="primary" size="sm" />
        </Stack>
      </Card>
    </Stack>

    <Stack gap={1}>
      <Text type="supporting">hAlign=&quot;center&quot; on a vertical stack</Text>
      <Card padding={4}>
        <Stack gap={1} hAlign="center">
          <Text type="display-3" hasTabularNumbers>
            R 4 820.50
          </Text>
          <Text type="supporting">Taken today across 37 sales</Text>
        </Stack>
      </Card>
    </Stack>
  </Stack>
);

/**
 * `wrap="wrap"` before nesting stacks — the quick-add tiles on the till reflow
 * onto a second line rather than squeezing on a narrow phone.
 */
export const Wrapping = () => (
  <Stack gap={2} width={330}>
    <Text type="label">Quick add</Text>
    <Stack direction="horizontal" gap={2} wrap="wrap">
      {[
        'Maize meal',
        'Cooking oil',
        'Brown bread',
        'Paraffin',
        'Airtime R5',
        'Cold drink',
      ].map((item) => (
        <Card key={item} padding={2} variant="muted">
          <Text>{item}</Text>
        </Card>
      ))}
    </Stack>
  </Stack>
);

/** `padding` and `isScrollable` come off the same scale as Card and Section. */
export const PaddingAndScroll = () => (
  <Stack direction="horizontal" gap={3} vAlign="start">
    <Stack gap={1}>
      <Text type="supporting">padding={4}</Text>
      <Card padding={0} width={190}>
        <Stack gap={1} padding={4}>
          <Text type="label">Change to give</Text>
          <Text type="display-3" hasTabularNumbers>
            R 19.50
          </Text>
        </Stack>
      </Card>
    </Stack>
    <Stack gap={1}>
      <Text type="supporting">padding={2} isScrollable</Text>
      <Card padding={0} width={190}>
        <Stack gap={2} padding={2} height={132} isScrollable>
          <Text type="label">Items running low</Text>
          <Text>Cooking oil — 3 left</Text>
          <Text>Paraffin — 2 left</Text>
          <Text>Sugar 2 kg — 4 left</Text>
          <Text>Candles — 1 left</Text>
          <Text>Matches — 5 left</Text>
        </Stack>
      </Card>
    </Stack>
  </Stack>
);

/** A `StackItem size="fill"` takes the leftover width; the ends stay intrinsic. */
export const FillingSpace = () => (
  <Card padding={3} width={420}>
    <Stack direction="horizontal" gap={3} vAlign="center">
      <StackItem size="static">
        <Badge variant="teal" label="Order 1042" />
      </StackItem>
      <StackItem size="fill">
        <Stack gap={0.5}>
          <Heading level={5}>Kasi Corner Store</Heading>
          <Text type="supporting">Diepkloof · 4 items · R 312.75</Text>
        </Stack>
      </StackItem>
      <StackItem size="static">
        <Button label="Accept" variant="primary" size="sm" />
      </StackItem>
    </Stack>
  </Card>
);

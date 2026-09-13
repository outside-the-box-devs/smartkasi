import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';

/**
 * GridSpan is only meaningful inside a Grid. `columns={2}` lets the takings
 * panel — the number the owner opens the app for — take twice the width of
 * the change float beside it.
 */
export const WideStat = () => (
  <Grid columns={3} gap={3} width={600}>
    <GridSpan columns={2}>
      <Card padding={4}>
        <VStack gap={1}>
          <Text type="supporting">Takings today</Text>
          <Text type="display-3" hasTabularNumbers>
            R 4 820.50
          </Text>
          <Text type="supporting">Across 37 sales at Thoko’s Spaza</Text>
        </VStack>
      </Card>
    </GridSpan>
    <Card padding={4}>
      <VStack gap={1}>
        <Text type="supporting">Change float</Text>
        <Text type="large" weight="semibold" hasTabularNumbers>
          R 380.00
        </Text>
      </VStack>
    </Card>
  </Grid>
);

/** `columns="full"` runs a banner row edge to edge, whatever the column count. */
export const FullWidthRow = () => (
  <Grid columns={3} gap={3} width={600}>
    <GridSpan columns="full">
      <Card padding={3} variant="muted">
        <HStack gap={3} hAlign="between" vAlign="center">
          <HStack gap={2} vAlign="center">
            <StatusDot variant="warning" label="Not sent" />
            <Text>12 sales are waiting to sync. They will send when you get signal.</Text>
          </HStack>
          <Badge variant="warning" label="12" />
        </HStack>
      </Card>
    </GridSpan>
    {[
      ['Maize meal', '24 in stock'],
      ['Brown bread', '11 in stock'],
      ['Cooking oil', '3 in stock'],
    ].map(([product, qty]) => (
      <Card key={product} padding={3}>
        <VStack gap={0.5}>
          <Text weight="semibold">{product}</Text>
          <Text type="supporting">{qty}</Text>
        </VStack>
      </Card>
    ))}
  </Grid>
);

/** `rows` spans downward — a tall order queue beside two short stat tiles. */
export const RowSpan = () => (
  <Grid columns={3} gap={3} width={600}>
    <GridSpan rows={2}>
      <Card padding={3} height="100%">
        <VStack gap={2}>
          <Heading level={5}>Orders waiting</Heading>
          {[
            ['1042', 'Pending'],
            ['1043', 'Accepted'],
            ['1044', 'Ready'],
          ].map(([id, stage]) => (
            <HStack key={id} gap={2} hAlign="between" vAlign="center">
              <Text type="supporting">Order {id}</Text>
              <Text type="supporting">{stage}</Text>
            </HStack>
          ))}
        </VStack>
      </Card>
    </GridSpan>
    <GridSpan columns={2}>
      <Card padding={3}>
        <VStack gap={0.5}>
          <Text type="supporting">Takings today</Text>
          <Text type="large" weight="semibold" hasTabularNumbers>
            R 4 820.50
          </Text>
        </VStack>
      </Card>
    </GridSpan>
    <GridSpan columns={2}>
      <Card padding={3}>
        <VStack gap={0.5}>
          <Text type="supporting">Items running low</Text>
          <Text type="large" weight="semibold" hasTabularNumbers>
            7
          </Text>
        </VStack>
      </Card>
    </GridSpan>
  </Grid>
);

/**
 * A full dashboard band: one hero panel over two thirds, a supporting tile,
 * then a full-width queue. Every child is a GridSpan or a plain grid cell —
 * no manual CSS grid anywhere.
 */
export const DashboardBand = () => (
  <Grid columns={3} gap={3} width={600}>
    <GridSpan columns={2}>
      <Card padding={4}>
        <VStack gap={2}>
          <Heading level={4}>Thoko’s Spaza</Heading>
          <Text color="secondary">
            Orlando East · open 06:00 to 20:00, seven days a week
          </Text>
          <HStack gap={2} vAlign="center">
            <Badge variant="success" label="Verified" />
            <Text type="supporting">Licence checked 14 August</Text>
          </HStack>
        </VStack>
      </Card>
    </GridSpan>
    <Card padding={4}>
      <VStack gap={1}>
        <Text type="supporting">Change to give</Text>
        <Text type="display-3" hasTabularNumbers>
          R 19.50
        </Text>
      </VStack>
    </Card>
    <GridSpan columns="full">
      <Card padding={3}>
        <HStack gap={3} hAlign="between" vAlign="center">
          <Text type="label">Next order</Text>
          <Text type="supporting">Kasi Corner Store · Diepkloof · 4 items</Text>
          <Text weight="semibold" hasTabularNumbers>
            R 312.75
          </Text>
        </HStack>
      </Card>
    </GridSpan>
  </Grid>
);

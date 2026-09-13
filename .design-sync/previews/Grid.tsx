import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const stats = [
  ['Takings today', 'R 4 820.50'],
  ['Sales rung up', '37'],
  ['Orders waiting', '3'],
  ['Items running low', '7'],
];

/** A fixed column count for the stat row at the top of the shop dashboard. */
export const StatRow = () => (
  <Grid columns={4} gap={3} width={640}>
    {stats.map(([label, value]) => (
      <Card key={label} padding={3}>
        <VStack gap={1}>
          <Text type="supporting">{label}</Text>
          <Text type="large" weight="semibold" hasTabularNumbers>
            {value}
          </Text>
        </VStack>
      </Card>
    ))}
  </Grid>
);

const shops = [
  ['Thoko’s Spaza', 'Orlando East', 'success', 'Verified'],
  ['Kasi Corner Store', 'Diepkloof', 'warning', 'Under review'],
  ['Mama Ndlovu Tuck Shop', 'Meadowlands', 'neutral', 'Not submitted'],
  ['Zola Fresh Produce', 'Zola', 'success', 'Verified'],
  ['Pimville Mini Market', 'Pimville', 'warning', 'Under review'],
] as const;

/**
 * Responsive columns: `minWidth` sets the narrowest a shop card may get, and
 * the grid decides how many fit. On a phone this becomes one column with no
 * media query of your own.
 */
export const ResponsiveShopCards = () => (
  <Grid columns={{minWidth: 200, max: 3}} gap={3} width={660}>
    {shops.map(([name, township, variant, licence]) => (
      <Card key={name} padding={3}>
        <VStack gap={2} hAlign="start">
          <Heading level={5}>{name}</Heading>
          <Text type="supporting">{township}</Text>
          <Badge variant={variant} label={licence} />
        </VStack>
      </Card>
    ))}
  </Grid>
);

/** `max` caps the row so cards never stretch into unreadable bands. */
export const ColumnCap = () => (
  <VStack gap={4} width={660}>
    <VStack gap={1}>
      <Text type="supporting">columns=&#123;&#123;minWidth: 150&#125;&#125; — as many as fit</Text>
      <Grid columns={{minWidth: 150}} gap={2}>
        {['Maize meal', 'Cooking oil', 'Brown bread', 'Paraffin'].map((p) => (
          <Card key={p} padding={2} variant="muted">
            <Text>{p}</Text>
          </Card>
        ))}
      </Grid>
    </VStack>
    <VStack gap={1}>
      <Text type="supporting">columns=&#123;&#123;minWidth: 150, max: 2&#125;&#125; — capped at two</Text>
      <Grid columns={{minWidth: 150, max: 2}} gap={2}>
        {['Maize meal', 'Cooking oil', 'Brown bread', 'Paraffin'].map((p) => (
          <Card key={p} padding={2} variant="muted">
            <Text>{p}</Text>
          </Card>
        ))}
      </Grid>
    </VStack>
  </VStack>
);

/** `rowGap` and `columnGap` override `gap` per axis when rows need more air. */
export const AxisGaps = () => (
  <Grid columns={3} rowGap={6} columnGap={2} width={520}>
    {[
      ['Sunfoil 2 L', 'R 74.50'],
      ['Iwisa 10 kg', 'R 109.99'],
      ['Albany 700 g', 'R 18.99'],
      ['Paraffin 1 L', 'R 32.00'],
      ['Selati 2 kg', 'R 46.00'],
      ['Airtime R5', 'R 5.00'],
    ].map(([product, price]) => (
      <Card key={product} padding={2}>
        <VStack gap={0.5}>
          <Text>{product}</Text>
          <Text type="supporting" hasTabularNumbers>
            {price}
          </Text>
        </VStack>
      </Card>
    ))}
  </Grid>
);

/**
 * GridSpan mixes widths inside one grid — the takings panel takes two of the
 * three columns and the order queue runs the full width beneath it.
 */
export const MixedSpans = () => (
  <Grid columns={3} gap={3} width={620}>
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
    <GridSpan columns="full">
      <Card padding={3}>
        <HStack gap={3} hAlign="between" vAlign="center">
          <HStack gap={2} vAlign="center">
            <StatusDot variant="warning" label="Pending" />
            <Text>Order 1042 — Kasi Corner Store, 4 items</Text>
          </HStack>
          <Text weight="semibold" hasTabularNumbers>
            R 312.75
          </Text>
        </HStack>
      </Card>
    </GridSpan>
  </Grid>
);

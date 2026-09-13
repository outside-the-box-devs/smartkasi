import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

/** Dashboard stat cards — the exact widget shape from the owner's home screen. */
export const QuickStats = () => (
  <Grid gap={4} columns={{minWidth: 180, max: 3}}>
    <Card elevation="low">
      <VStack gap={1}>
        <Text type="supporting">Shops</Text>
        <Heading level={3}>3</Heading>
        <Text type="supporting">2 licences verified</Text>
      </VStack>
    </Card>
    <Card elevation="low">
      <VStack gap={1}>
        <Text type="supporting">Taking orders</Text>
        <Heading level={3}>2</Heading>
        <Text type="supporting">visible to customers now</Text>
      </VStack>
    </Card>
    <Card elevation="low">
      <VStack gap={1}>
        <Text type="supporting">Items running low</Text>
        <Heading level={3}>4</Heading>
        <Text type="supporting" style={{color: 'var(--color-warning)'}}>
          need restocking
        </Text>
      </VStack>
    </Card>
  </Grid>
);

/** A single shop, as a self-contained, reorderable unit — the case for a Card. */
export const ShopSummary = () => (
  <Card width={300}>
    <VStack gap={2}>
      <HStack gap={2} style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading level={4}>Thoko&apos;s Spaza</Heading>
        <Badge variant="success" label="Verified" />
      </HStack>
      <Text color="secondary">Orlando East</Text>
      <Text type="supporting">24 products · 2 waiting to sync</Text>
    </VStack>
  </Card>
);

/** Non-semantic colour variants classify shop type; they never carry status. */
export const ShopTypeCategories = () => (
  <HStack gap={3} style={{flexWrap: 'wrap'}}>
    <Card variant="teal" width={160}>
      <Text weight="semibold">Full store</Text>
    </Card>
    <Card variant="blue" width={160}>
      <Text weight="semibold">Stock only</Text>
    </Card>
    <Card variant="purple" width={160}>
      <Text weight="semibold">Advertising only</Text>
    </Card>
  </HStack>
);

/** Elevation is reserved for cards that need to float above the page. */
export const ElevationScale = () => (
  <HStack gap={4} style={{flexWrap: 'wrap'}}>
    {(['none', 'low', 'med', 'high'] as const).map((elevation) => (
      <Card key={elevation} elevation={elevation} width={140}>
        <Text type="label">{elevation}</Text>
      </Card>
    ))}
  </HStack>
);

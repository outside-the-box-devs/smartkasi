import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Card} from '@astryxdesign/core/Card';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Grid} from '@astryxdesign/core/Grid';

/** The dashboard's stat-card row while shop counts are still loading. */
export const StatCardRow = () => (
  <Grid gap={4} columns={{minWidth: 180, max: 3}} style={{width: 560}}>
    {[0, 1, 2].map((i) => (
      <Card key={i}>
        <VStack gap={2}>
          <Skeleton height={12} width={96} index={i * 2} />
          <Skeleton height={28} width={64} index={i * 2 + 1} />
        </VStack>
      </Card>
    ))}
  </Grid>
);

/** A stock table's rows while product data is still loading. */
export const TableLoading = () => (
  <Card style={{width: 420}}>
    <VStack gap={3}>
      <Skeleton height={16} width={140} />
      {[0, 1, 2, 3].map((i) => (
        <HStack key={i} gap={3} style={{alignItems: 'center'}}>
          <Skeleton height={36} width={36} radius="rounded" index={i} />
          <VStack gap={1} style={{flex: 1}}>
            <Skeleton height={12} width="70%" index={i + 1} />
            <Skeleton height={10} width="40%" index={i + 2} />
          </VStack>
          <Skeleton height={20} width={60} index={i + 3} />
        </HStack>
      ))}
    </VStack>
  </Card>
);

/** A shop card's header while the profile loads: avatar, name, township line. */
export const ShopCardLoading = () => (
  <Card style={{width: 320}}>
    <HStack gap={3} style={{alignItems: 'center'}}>
      <Skeleton height={48} width={48} radius="rounded" index={0} />
      <VStack gap={1} style={{flex: 1}}>
        <Skeleton height={14} width="80%" index={1} />
        <Skeleton height={11} width="50%" index={2} />
      </VStack>
    </HStack>
  </Card>
);

/** A single loading paragraph, staggered lines shortening toward the end. */
export const TextBlockLoading = () => (
  <VStack gap={2} style={{width: 280}}>
    <Skeleton height={10} width="100%" index={0} />
    <Skeleton height={10} width="95%" index={1} />
    <Skeleton height={10} width="60%" index={2} />
  </VStack>
);

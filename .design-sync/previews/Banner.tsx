import {Banner} from '@astryxdesign/core/Banner';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';

/** Offline-first is the headline promise — this is the banner that proves it. */
export const OfflineStatus = () => (
  <Banner
    status="info"
    title="Can't reach the server — your data is safe"
    description="Sales keep working from this device. We'll sync automatically once you're back online."
  />
);

/** Low stock across the shop, with the affected products listed below the header. */
export const LowStockWithDetail = () => (
  <Banner
    status="warning"
    title="7 items running low"
    description="Restock these soon — customers see them as low availability."
    isDismissable
    defaultIsExpanded
  >
    <VStack gap={2}>
      <HStack gap={2} style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <VStack gap={1}>
          <Text weight="semibold">Cooking oil</Text>
          <Text type="supporting">Sunfoil · 2 L</Text>
        </VStack>
        <Badge variant="warning" label="3 left" />
      </HStack>
      <HStack gap={2} style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <VStack gap={1}>
          <Text weight="semibold">Paraffin</Text>
          <Text type="supporting">Blue · 1 L</Text>
        </VStack>
        <Badge variant="warning" label="2 left" />
      </HStack>
    </VStack>
  </Banner>
);

/** Licence rejected — an error stays visible with an action to fix it. */
export const LicenceRejected = () => (
  <Banner
    status="error"
    title="Licence documents rejected"
    description="Thoko's Spaza can't take orders until a valid trading licence is uploaded again."
    endContent={<Button variant="secondary" label="Upload again" />}
  />
);

/** Sync finished — a success confirmation the owner can dismiss. */
export const SyncComplete = () => (
  <Banner
    status="success"
    title="Synced 2 minutes ago"
    description="12 sales and 3 stock updates from Kasi Corner Store are now on the server."
    isDismissable
  />
);

/** Full-width variant for page-level notices, like a scheduled maintenance window. */
export const PageLevelMaintenance = () => (
  <Banner
    status="info"
    container="section"
    title="Payments are running slowly tonight"
    description="Card top-ups may take longer than usual between 8 PM and 10 PM."
  />
);

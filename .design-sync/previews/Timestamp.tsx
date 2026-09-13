import {Timestamp} from '@astryxdesign/core/Timestamp';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

/** A sync status line — relative time, the everyday pattern for recency. */
export const SyncedRecently = () => (
  <HStack gap={2} style={{alignItems: 'center'}}>
    <Text color="secondary">Last synced</Text>
    <Timestamp value={Math.floor(Date.now() / 1000) - 120} format="relative" isLive />
  </HStack>
);

/** Auto format switches from relative to a full date once an order gets old. */
export const OrderPlacedAuto = () => (
  <VStack gap={1}>
    <HStack gap={2}>
      <Text color="secondary">Placed</Text>
      <Timestamp value={Math.floor(Date.now() / 1000) - 600} format="auto" />
    </HStack>
    <HStack gap={2}>
      <Text color="secondary">Placed</Text>
      <Timestamp value="2025-11-02T09:15:00Z" format="auto" />
    </HStack>
  </VStack>
);

/** A licence submission date, shown as an absolute date for a record that needs precision. */
export const LicenceSubmittedDate = () => (
  <HStack gap={2}>
    <Text color="secondary">Submitted</Text>
    <Timestamp value="2026-01-14T10:30:00Z" format="date_long" />
  </HStack>
);

/** Compact relative time for a dense order history list. */
export const CompactOrderHistory = () => (
  <VStack gap={2}>
    {[
      {id: 'o1', secondsAgo: 300, label: 'Order #1042'},
      {id: 'o2', secondsAgo: 5400, label: 'Order #1041'},
      {id: 'o3', secondsAgo: 90000, label: 'Order #1039'},
    ].map((o) => (
      <HStack key={o.id} gap={3} style={{justifyContent: 'space-between', width: 260}}>
        <Text>{o.label}</Text>
        <Timestamp
          value={Math.floor(Date.now() / 1000) - o.secondsAgo}
          format="relative_short"
          type="supporting"
        />
      </HStack>
    ))}
  </VStack>
);

/** Multi-timezone tooltip entries for a courier delivery log spanning regions. */
export const MultiZoneTooltip = () => (
  <HStack gap={2}>
    <Text color="secondary">Delivered</Text>
    <Timestamp
      value="2026-02-19T17:00:00Z"
      format="date_time"
      isTimezoneShown
      tooltipEntries={[
        {label: 'Johannesburg', timezoneID: 'Africa/Johannesburg', isCopyable: true},
        {label: 'UTC', timezoneID: 'UTC', isCopyable: true},
      ]}
    />
  </HStack>
);

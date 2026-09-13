import {StatusDot} from '@astryxdesign/core/StatusDot';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';

/** Open/closed for a shop, always paired with visible text — the dot alone means nothing. */
export const ShopOpenClosed = () => (
  <VStack gap={2}>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="success" label="Open" />
      <Text color="primary">Thoko&apos;s Spaza — Open</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="neutral" label="Closed" />
      <Text color="secondary">Kasi Corner Store — Closed</Text>
    </HStack>
  </VStack>
);

/** Live order feed indicator — pulsing to show it's actively polling. */
export const LiveOrdersFeed = () => (
  <HStack gap={2} style={{alignItems: 'center'}}>
    <StatusDot variant="success" isPulsing label="Live" />
    <Text type="supporting">Auto-refreshes every 20 seconds</Text>
  </HStack>
);

/** Licence review states across the semantic variants, each with visible text. */
export const LicenceStates = () => (
  <VStack gap={2}>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="success" label="Verified" tooltip="Licence documents approved" />
      <Text color="primary">Verified</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="warning" label="Under review" tooltip="Documents submitted, awaiting review" />
      <Text color="primary">Under review</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="error" label="Rejected" tooltip="Documents were rejected — resubmit" />
      <Text color="primary">Rejected</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <StatusDot variant="neutral" label="Not submitted" />
      <Text color="secondary">Not submitted</Text>
    </HStack>
  </VStack>
);

/** A dot standing alone next to an order card needs an icon, since there's no adjacent word. */
export const IconReinforced = () => (
  <HStack gap={4} style={{alignItems: 'center'}}>
    <StatusDot variant="success" label="Accepted" icon={<Icon icon="check" size="xsm" />} />
    <StatusDot variant="error" label="Rejected" icon={<Icon icon="close" size="xsm" />} />
    <StatusDot variant="warning" label="Pending" icon={<Icon icon="clock" size="xsm" />} />
  </HStack>
);

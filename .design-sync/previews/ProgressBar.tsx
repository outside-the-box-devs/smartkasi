import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

/** Daily takings against a target — the value label makes the number concrete. */
export const TakingsTarget = () => (
  <VStack gap={2} style={{width: 360}}>
    <Text type="label">Today&apos;s takings vs. target</Text>
    <ProgressBar
      label="Progress toward today's takings target"
      value={3820}
      max={5000}
      hasValueLabel
      formatValueLabel={(value) => `R ${value.toLocaleString('en-ZA')} / R 5 000`}
      variant="accent"
    />
  </VStack>
);

/** Stock nearly out — the warning variant flags it before it hits zero. */
export const StockRunningLow = () => (
  <VStack gap={2} style={{width: 320}}>
    <Text type="label">Cooking oil (Sunfoil 2L) remaining</Text>
    <ProgressBar label="Cooking oil stock remaining" value={3} max={40} hasValueLabel variant="warning" />
  </VStack>
);

/** Sync uploading — indeterminate because we don't know how much is left. */
export const SyncingIndeterminate = () => (
  <VStack gap={2} style={{width: 320}}>
    <Text type="label">Syncing sales to the server</Text>
    <ProgressBar label="Syncing sales" isIndeterminate variant="accent" />
  </VStack>
);

/** Licence upload complete — success variant confirms the finished step. */
export const UploadComplete = () => (
  <VStack gap={2} style={{width: 320}}>
    <Text type="label">Licence document upload</Text>
    <ProgressBar label="Licence document upload" value={100} hasValueLabel variant="success" />
  </VStack>
);

/** A monthly sales goal drawn as a mark on the track, hit partway through the month. */
export const GoalMark = () => (
  <VStack gap={2} style={{width: 320}}>
    <Text type="label">Orlando East — monthly sales goal</Text>
    <ProgressBar
      label="Progress toward the monthly sales goal"
      value={18500}
      max={25000}
      hasValueLabel
      formatValueLabel={(value) => `R ${value.toLocaleString('en-ZA')}`}
      marks={[{value: 20000, label: 'Goal: R 20 000'}]}
      variant="accent"
    />
  </VStack>
);

/** A cancelled restock order — disabled state grays out the fill. */
export const CancelledRestock = () => (
  <VStack gap={2} style={{width: 320}}>
    <Text type="label">Maize meal restock order (cancelled)</Text>
    <ProgressBar label="Maize meal restock order, cancelled" value={40} hasValueLabel isDisabled />
  </VStack>
);

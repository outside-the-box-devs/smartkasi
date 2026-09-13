import {Spinner} from '@astryxdesign/core/Spinner';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Button} from '@astryxdesign/core/Button';

/** The three sizes side by side, small to large. */
export const Sizes = () => (
  <HStack gap={5} style={{alignItems: 'center'}}>
    <Spinner size="sm" aria-label="Loading" />
    <Spinner size="md" aria-label="Loading" />
    <Spinner size="lg" aria-label="Loading" />
  </HStack>
);

/** Submitting a sale — a spinner beside a disabled button; the button already says what's loading. */
export const SubmittingSale = () => (
  <HStack gap={3} style={{alignItems: 'center'}}>
    <Button variant="primary" label="Recording sale…" isDisabled />
    <Spinner size="sm" aria-label="Recording sale" />
  </HStack>
);

/** Fetching a shop's order history — a labelled spinner in page content. */
export const LoadingOrders = () => (
  <VStack gap={2} style={{alignItems: 'center'}}>
    <Spinner size="md" label="Loading orders" />
  </VStack>
);

/** onMedia shade for a spinner sitting on a dark, accent-coloured surface. */
export const OnAccentBackground = () => (
  <VStack
    gap={2}
    style={{
      alignItems: 'center',
      padding: 'var(--spacing-5)',
      background: 'var(--color-accent)',
      borderRadius: 'var(--radius-container)',
    }}
  >
    <Spinner size="md" shade="onMedia" label="Uploading licence document…" />
  </VStack>
);

import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {
  ArrowPathIcon,
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * The four variants, in the order emphasis drops. Exactly one primary per
 * view — here it is the only thing that finishes the customer's sale.
 */
export const Variants = () => (
  <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'center'}}>
    <Button label="Complete sale" variant="primary" />
    <Button label="Add a shop" variant="secondary" />
    <Button label="Or scan with the camera" variant="ghost" />
    <Button label="Remove from stock" variant="destructive" />
  </HStack>
);

/**
 * Sizes. `lg` is the till button: it is pressed with a thumb, often outdoors,
 * sometimes in a hurry.
 */
export const Sizes = () => (
  <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'center'}}>
    <Button label="Undo" variant="secondary" size="sm" />
    <Button label="Add to stock" variant="secondary" size="md" />
    <Button label="Complete sale" variant="primary" size="lg" />
  </HStack>
);

/**
 * The three action states, side by side so the axis reads. `isLoading` swaps
 * the label for a spinner and keeps the button's own width — give a loading
 * button a `width` (or a neighbouring caption) so the row does not jump.
 * `isDisabled` dims but keeps the label, because the owner still needs to
 * know what they cannot do yet.
 */
export const LoadingAndDisabled = () => (
  <VStack gap={4}>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Ready
      </Text>
      <Button label="Complete sale" variant="primary" width={150} />
      <Button label="Sync 3 saved" variant="secondary" width={150} />
    </HStack>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Working
      </Text>
      <Button label="Complete sale" variant="primary" width={150} isLoading />
      <Button label="Sync 3 saved" variant="secondary" width={150} isLoading />
    </HStack>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Not yet
      </Text>
      <Button label="Complete sale" variant="primary" width={150} isDisabled />
      <Button label="Sync 3 saved" variant="secondary" width={150} isDisabled />
    </HStack>
    <Text type="supporting">
      &ldquo;Complete sale&rdquo; stays disabled until the till has one item scanned.
    </Text>
  </VStack>
);

/**
 * A leading icon reinforces the label; `endContent` carries a count. Both are
 * ignored on an icon-only button, which is what IconButton is for.
 */
export const IconsAndCounts = () => (
  <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'center'}}>
    <Button label="Add to stock" variant="primary" icon={<PlusIcon />} />
    <Button
      label="Sync saved sales"
      variant="secondary"
      icon={<ArrowPathIcon />}
      endContent={<Badge variant="warning" label="3" />}
    />
    <Button label="Remove from stock" variant="destructive" icon={<TrashIcon />} />
  </HStack>
);

/**
 * The real till footer from `POSPanel`: one primary that takes the money, one
 * secondary that clears the offline queue. `width="100%"` gives the thumb the
 * whole row on a phone.
 */
export const TillActions = () => (
  <VStack gap={3} style={{width: 320}}>
    <HStack gap={3} style={{justifyContent: 'space-between', alignItems: 'center'}}>
      <Text type="label">Total</Text>
      <Text type="large" weight="semibold" hasTabularNumbers>
        R 187.49
      </Text>
    </HStack>
    <Button
      label="Complete sale"
      variant="primary"
      size="lg"
      width="100%"
      icon={<BanknotesIcon />}
    />
    <Button label="Sync 3 saved" variant="secondary" width="100%" />
  </VStack>
);

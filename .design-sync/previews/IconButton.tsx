import {IconButton} from '@astryxdesign/core/IconButton';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {
  ArrowPathIcon,
  CameraIcon,
  MinusIcon,
  PencilSquareIcon,
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * The four variants. An IconButton has no visible text, so `label` is the
 * accessible name and `tooltip` is the sighted user's only hint — both are
 * mandatory, not optional polish.
 */
export const Variants = () => (
  <HStack gap={3} style={{alignItems: 'center'}}>
    <IconButton
      variant="primary"
      icon={<QrCodeIcon />}
      label="Scan a barcode"
      tooltip="Scan a barcode"
    />
    <IconButton
      variant="secondary"
      icon={<PencilSquareIcon />}
      label="Edit this product"
      tooltip="Edit this product"
    />
    <IconButton
      variant="ghost"
      icon={<ArrowPathIcon />}
      label="Sync saved sales"
      tooltip="Sync saved sales"
    />
    <IconButton
      variant="destructive"
      icon={<TrashIcon />}
      label="Remove from stock"
      tooltip="Remove from stock"
    />
  </HStack>
);

/** Sizes. `sm` belongs in a dense stock table row, `lg` under a thumb. */
export const Sizes = () => (
  <HStack gap={6} style={{alignItems: 'flex-end'}}>
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <VStack key={size} gap={2} style={{alignItems: 'center'}}>
        <IconButton size={size} variant="secondary" icon={<PlusIcon />} label="Add one" tooltip="Add one" />
        <Text type="supporting">{size}</Text>
      </VStack>
    ))}
  </HStack>
);

/**
 * Working and unavailable. The spinner replaces the icon, so keep the button
 * in place rather than swapping it out — the owner is watching that spot.
 */
export const ButtonStates = () => (
  <VStack gap={3}>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Ready
      </Text>
      <IconButton icon={<ArrowPathIcon />} label="Sync saved sales" tooltip="Sync saved sales" />
    </HStack>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Syncing
      </Text>
      <IconButton icon={<ArrowPathIcon />} label="Sync saved sales" isLoading />
    </HStack>
    <HStack gap={4} style={{alignItems: 'center'}}>
      <Text type="label" style={{width: 90}}>
        Offline
      </Text>
      <IconButton icon={<ArrowPathIcon />} label="Sync saved sales" isDisabled />
    </HStack>
  </VStack>
);

/**
 * A stock row's quantity stepper and its row actions. Ghost keeps a dense
 * table quiet; destructive is the only one that shouts.
 */
export const StockRowActions = () => (
  <VStack gap={3} style={{width: 360}}>
    <HStack gap={3} style={{justifyContent: 'space-between', alignItems: 'center'}}>
      <VStack gap={1}>
        <Text weight="semibold">Maize meal</Text>
        <Text type="supporting">Iwisa · 10 kg · R 109.99</Text>
      </VStack>
      <HStack gap={2} style={{alignItems: 'center'}}>
        <IconButton size="sm" variant="ghost" icon={<MinusIcon />} label="One less" tooltip="One less" />
        <Text hasTabularNumbers weight="semibold">
          24
        </Text>
        <IconButton size="sm" variant="ghost" icon={<PlusIcon />} label="One more" tooltip="One more" />
        <IconButton size="sm" variant="ghost" icon={<PencilSquareIcon />} label="Edit maize meal" tooltip="Edit" />
        <IconButton size="sm" variant="destructive" icon={<TrashIcon />} label="Remove maize meal from stock" tooltip="Remove" />
      </HStack>
    </HStack>
  </VStack>
);

/**
 * Elevation raises an icon-only button off the page — the shape SmartKasi uses
 * for the camera scanner that floats over the stock list.
 */
export const FloatingScanner = () => (
  <Card>
    <VStack gap={3}>
      <Text type="label">Shadow depth on a card surface</Text>
      <HStack gap={8} style={{alignItems: 'flex-end', paddingBlock: 'var(--spacing-4)'}}>
        {(['none', 'low', 'med', 'high'] as const).map((depth) => (
          <VStack key={depth} gap={3} style={{alignItems: 'center'}}>
            <IconButton
              variant="primary"
              size="lg"
              elevation={depth}
              icon={<CameraIcon />}
              label="Scan with the camera"
              tooltip="Scan with the camera"
            />
            <Text type="supporting">{depth}</Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  </Card>
);

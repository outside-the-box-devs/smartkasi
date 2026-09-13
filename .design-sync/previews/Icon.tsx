import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

/** Nav icons from the app shell, paired with visible labels rather than icon-only. */
export const NavIcons = () => (
  <HStack gap={5}>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon={BuildingStorefrontIcon} size="md" color="primary" />
      <Text>Shops</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon={ShoppingBagIcon} size="md" color="primary" />
      <Text>Orders</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon={ArchiveBoxIcon} size="md" color="primary" />
      <Text>Stock</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon={BanknotesIcon} size="md" color="primary" />
      <Text>Sales</Text>
    </HStack>
  </HStack>
);

/** The size scale, smallest to largest, on the same semantic icon. */
export const Sizes = () => (
  <HStack gap={4} style={{alignItems: 'center'}}>
    <Icon icon="search" size="xsm" />
    <Icon icon="search" size="sm" />
    <Icon icon="search" size="md" />
    <Icon icon="search" size="lg" />
  </HStack>
);

/** Semantic status icons, coloured to match the state they represent. */
export const StatusColors = () => (
  <HStack gap={4}>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon="success" color="success" size="md" />
      <Text color="primary">Verified</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon="warning" color="warning" size="md" />
      <Text color="primary">Under review</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center'}}>
      <Icon icon="error" color="error" size="md" />
      <Text color="primary">Rejected</Text>
    </HStack>
  </HStack>
);

/** A standalone icon-only button target needs an accessible label via `label`. */
export const StandaloneWithLabel = () => (
  <VStack gap={2}>
    <Icon icon={BuildingStorefrontIcon} size="lg" color="accent" label="Shop" />
    <Text type="supporting">Icon-only — accessible name set via the label prop</Text>
  </VStack>
);

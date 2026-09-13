import {Token} from '@astryxdesign/core/Token';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {BuildingStorefrontIcon} from '@heroicons/react/24/outline';

/** Active search filters on the shops list, each removable. */
export const ActiveFilters = () => (
  <VStack gap={2}>
    <Text type="label">Filtering by</Text>
    <HStack gap={2} style={{flexWrap: 'wrap'}}>
      <Token label="Orlando East" color="teal" onRemove={() => {}} />
      <Token label="Verified licence" color="green" onRemove={() => {}} />
      <Token label="Accepting orders" color="blue" onRemove={() => {}} />
    </HStack>
  </VStack>
);

/** Product category tags shown on a stock item, not removable. */
export const ProductCategories = () => (
  <HStack gap={2}>
    <Token label="Groceries" color="default" />
    <Token label="Cold drinks" color="cyan" />
    <Token label="Essentials" color="purple" />
  </HStack>
);

/** A leading icon identifies the token type at a glance — a shop selected as a filter. */
export const IconLeadingToken = () => (
  <Token
    label="Thoko's Spaza"
    icon={<Icon icon={BuildingStorefrontIcon} size="xsm" />}
    color="teal"
    onRemove={() => {}}
  />
);

/** The three sizes, small to large. */
export const Sizes = () => (
  <HStack gap={3} style={{alignItems: 'center'}}>
    <Token label="Small" size="sm" />
    <Token label="Medium" size="md" />
    <Token label="Large" size="lg" />
  </HStack>
);

/** A disabled token for a filter that can no longer be toggled. */
export const DisabledToken = () => (
  <Token label="Discontinued line" color="gray" isDisabled />
);

import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {BuildingStorefrontIcon, MapPinIcon} from '@heroicons/react/24/outline';

const SHOP_TYPES = [
  {value: 'full', label: 'Full store', description: 'Sells stock and takes orders'},
  {value: 'stock', label: 'Stock only', description: 'Keeps stock, no online orders'},
  {value: 'ads', label: 'Advertising only', description: 'Listed on the map, no stock tracked'},
];

/**
 * Shop type on the "Add a shop" form. Three fixed options with a description
 * each — a Selector reads better than three radios when the descriptions are
 * long, and better than a Typeahead when the list never grows.
 */
export const ShopType = () => (
  <Selector
    label="Shop type"
    options={SHOP_TYPES}
    value="full"
    onChange={() => {}}
    placeholder="Choose a shop type"
    width={300}
    isRequired
  />
);

/**
 * Sections and dividers organise a list that has passed ~8 items. Note the
 * section key is `options`, not `items`.
 */
export const TownshipsBySection = () => (
  <Selector
    label="Township"
    value="orlando-east"
    onChange={() => {}}
    placeholder="Choose a township"
    width={300}
    hasSearch
    searchPlaceholder="Search townships"
    startIcon={MapPinIcon}
    options={[
      {
        type: 'section',
        title: 'Soweto',
        options: [
          {value: 'orlando-east', label: 'Orlando East'},
          {value: 'diepkloof', label: 'Diepkloof'},
          {value: 'meadowlands', label: 'Meadowlands'},
          {value: 'zola', label: 'Zola'},
        ],
      },
      {type: 'divider'},
      {
        type: 'section',
        title: 'Ekurhuleni',
        options: [
          {value: 'tembisa', label: 'Tembisa'},
          {value: 'katlehong', label: 'Katlehong'},
          {value: 'vosloorus', label: 'Vosloorus'},
        ],
      },
    ]}
  />
);

/** Sizes, matched to the fields they sit beside. */
export const Sizes = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <Selector size="sm" label="Sort by" options={['Newest', 'Name A–Z', 'Most stock']} value="Newest" onChange={() => {}} width={200} />
    <Selector size="md" label="Shop type" options={SHOP_TYPES} value="stock" onChange={() => {}} width={260} />
    <Selector size="lg" label="Township" options={['Orlando East', 'Diepkloof', 'Zola']} value="Zola" onChange={() => {}} width={320} />
  </VStack>
);

/**
 * Validation and the two disabled shapes. `detached` again, so the message
 * does not sit on top of the next control in a stacked form.
 */
export const ValidationAndStates = () => (
  <VStack gap={5} style={{alignItems: 'flex-start'}}>
    <Selector
      label="Shop type"
      options={SHOP_TYPES}
      value=""
      onChange={() => {}}
      placeholder="Choose a shop type"
      width={300}
      isRequired
      status={{type: 'error', message: 'Pick a shop type before saving'}}
      statusVariant="detached"
    />
    <Selector
      label="Licence status"
      options={['Verified', 'Under review', 'Not submitted']}
      value="Under review"
      onChange={() => {}}
      width={300}
      status={{type: 'warning', message: 'Reviews usually take three working days'}}
      statusVariant="detached"
    />
    <Selector
      label="Shop type"
      options={SHOP_TYPES}
      value="full"
      onChange={() => {}}
      width={300}
      isDisabled
      disabledMessage="You can change this once your trading licence is verified"
    />
  </VStack>
);

/**
 * `variant="ghost"` drops the border so the selector sits level with the ghost
 * buttons in a toolbar. `hasClear` resets a filter in one tap.
 */
export const ToolbarFilters = () => (
  <HStack gap={3} style={{alignItems: 'center', flexWrap: 'wrap'}}>
    <Text type="label">Your shops</Text>
    <Selector
      label="Filter by township"
      isLabelHidden
      variant="ghost"
      options={['All townships', 'Orlando East', 'Diepkloof', 'Meadowlands', 'Zola']}
      value="Orlando East"
      onChange={() => {}}
      hasClear
      startIcon={MapPinIcon}
    />
    <Selector
      label="Filter by licence"
      isLabelHidden
      variant="ghost"
      options={['Any licence', 'Verified', 'Under review', 'Not submitted']}
      value="Any licence"
      onChange={() => {}}
    />
    <Button label="Add a shop" variant="secondary" icon={<BuildingStorefrontIcon />} />
  </HStack>
);

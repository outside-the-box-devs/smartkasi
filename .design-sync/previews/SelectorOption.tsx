import {Selector, SelectorOption} from '@astryxdesign/core/Selector';
import {Badge} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

const SHOP_TYPES = [
  {value: 'full', label: 'Full store', description: 'Sells stock and takes orders', icon: BuildingStorefrontIcon},
  {value: 'stock', label: 'Stock only', description: 'Keeps stock, no online orders', icon: BanknotesIcon},
  {value: 'ads', label: 'Advertising only', description: 'Listed on the map, no stock tracked', icon: MegaphoneIcon},
];

const byValue = (value: string) => SHOP_TYPES.find((o) => o.value === value) ?? SHOP_TYPES[0];

/**
 * SelectorOption is never a JSX child of Selector — it is what you return
 * from `renderOption` (the dropdown rows) and `renderValue` (the closed
 * trigger). Both are wired here; the trigger is what you can see standing
 * still, and it grows one text line to fit the stacked description.
 */
export const StackedWithDescription = () => (
  <Selector
    label="Shop type"
    options={SHOP_TYPES}
    value="full"
    onChange={() => {}}
    width={320}
    renderValue={(option) => (
      <SelectorOption
        label={option.label}
        description={byValue(option.value).description}
        icon={option.icon}
      />
    )}
    renderOption={(option) => (
      <SelectorOption
        label={option.label}
        description={byValue(option.value).description}
        icon={option.icon}
      />
    )}
  />
);

/**
 * `layout="inline"` folds the description onto the label's line, so the row
 * fits a fixed-height host. Same data, one line instead of two.
 */
export const InlineLayout = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <Selector
      label="Shop type — stacked"
      options={SHOP_TYPES}
      value="stock"
      onChange={() => {}}
      width={320}
      renderValue={(option) => (
        <SelectorOption label={option.label} description={byValue(option.value).description} layout="stacked" />
      )}
    />
    <Selector
      label="Shop type — inline"
      options={SHOP_TYPES}
      value="stock"
      onChange={() => {}}
      width={320}
      renderValue={(option) => (
        <SelectorOption label={option.label} description={byValue(option.value).description} layout="inline" />
      )}
    />
  </VStack>
);

/**
 * `endContent` puts a trailing badge on the row — how many of the owner's
 * shops are in each state, so the filter tells you before you open it.
 */
export const WithEndContent = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Selector
      label="Licence status"
      value="review"
      onChange={() => {}}
      width={320}
      options={[
        {value: 'verified', label: 'Verified'},
        {value: 'review', label: 'Under review'},
        {value: 'none', label: 'Not submitted'},
      ]}
      renderValue={(option) => (
        <SelectorOption
          label={option.label}
          layout="inline"
          endContent={
            <Badge
              variant={option.value === 'verified' ? 'success' : option.value === 'review' ? 'warning' : 'neutral'}
              label={option.value === 'verified' ? '2' : option.value === 'review' ? '1' : '1'}
            />
          }
        />
      )}
    />
    <Text type="supporting">The badge counts how many of your four shops are in that state.</Text>
  </VStack>
);

/** Label alone — the plain row, for a list that needs no second line. */
export const LabelOnly = () => (
  <Selector
    label="Sort your stock by"
    options={['Newest first', 'Name A–Z', 'Running low first', 'Best sellers']}
    value="Running low first"
    onChange={() => {}}
    width={320}
    renderValue={(option) => <SelectorOption label={option.label} />}
  />
);

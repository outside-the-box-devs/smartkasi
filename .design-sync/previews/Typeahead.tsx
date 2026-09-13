import {Typeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';

interface ProductItem extends SearchableItem<{barcode: string; price: string}> {}

const PRODUCTS: ProductItem[] = [
  {id: '1', label: 'Maize meal — Iwisa 10 kg', auxiliaryData: {barcode: '6001068000456', price: 'R 109.99'}},
  {id: '2', label: 'Cooking oil — Sunfoil 2 L', auxiliaryData: {barcode: '6009803152470', price: 'R 74.50'}},
  {id: '3', label: 'Brown bread — Albany 700 g', auxiliaryData: {barcode: '6001275000119', price: 'R 18.99'}},
  {id: '4', label: 'Paraffin — Blue 1 L', auxiliaryData: {barcode: '6009522100048', price: 'R 32.00'}},
  {id: '5', label: 'Airtime voucher — R 12', auxiliaryData: {barcode: '6000000000121', price: 'R 12.00'}},
];

// createStaticSource is the shipped helper for a list already on the device —
// exactly the offline-first case. debounceMs={0} because nothing is fetched.
const productSource = createStaticSource<ProductItem>(PRODUCTS, {
  keywords: (item) => [item.auxiliaryData?.barcode ?? ''],
});

/**
 * The catalogue is thousands of products long, so it is a Typeahead and not a
 * Selector. A chosen product shows as a token in the closed field; the
 * dropdown only exists while the owner is typing.
 */
export const ProductSearch = () => (
  <Typeahead
    label="Find a product"
    searchSource={productSource}
    value={PRODUCTS[0]}
    onChange={() => {}}
    placeholder="Search by name or barcode"
    description="Type part of a name, or scan the barcode"
    debounceMs={0}
    width={340}
  />
);

/** Nothing chosen yet — the placeholder is the only instruction on screen. */
export const EmptyAndRequired = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <Typeahead
      label="Find a product"
      searchSource={productSource}
      value={null}
      onChange={() => {}}
      placeholder="Search by name or barcode"
      debounceMs={0}
      width={340}
      isRequired
    />
    <Typeahead
      label="Also stocked at"
      searchSource={productSource}
      value={null}
      onChange={() => {}}
      placeholder="Optional — another shop of yours"
      debounceMs={0}
      width={340}
      isOptional
      hasEntriesOnFocus
    />
  </VStack>
);

/** Sizes, and the token inside the closed field scales with them. */
export const Sizes = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <Typeahead size="sm" label="Find a product (sm)" searchSource={productSource} value={PRODUCTS[2]} onChange={() => {}} debounceMs={0} width={340} />
    <Typeahead size="md" label="Find a product (md)" searchSource={productSource} value={PRODUCTS[2]} onChange={() => {}} debounceMs={0} width={340} />
    <Typeahead size="lg" label="Find a product (lg)" searchSource={productSource} value={PRODUCTS[2]} onChange={() => {}} debounceMs={0} width={340} />
  </VStack>
);

/** Validation and disabled, with the reason attached rather than a Tooltip. */
export const ValidationAndStates = () => (
  <VStack gap={5} style={{alignItems: 'flex-start'}}>
    <Typeahead
      label="Find a product"
      searchSource={productSource}
      value={null}
      onChange={() => {}}
      placeholder="Search by name or barcode"
      debounceMs={0}
      width={340}
      status={{type: 'error', message: 'Choose a product before setting a price'}}
      statusVariant="detached"
    />
    <Typeahead
      label="Find a product"
      searchSource={productSource}
      value={PRODUCTS[3]}
      onChange={() => {}}
      debounceMs={0}
      width={340}
      status={{type: 'success', message: 'Already on your shelf — this will update the price'}}
      statusVariant="detached"
    />
    <Typeahead
      label="Find a product"
      searchSource={productSource}
      value={PRODUCTS[1]}
      onChange={() => {}}
      debounceMs={0}
      width={340}
      isDisabled
      disabledMessage="Finish the sale at the till before editing stock"
    />
  </VStack>
);

/**
 * The composed "Add to stock" row: find the product, then price it. The
 * Typeahead does the searching a bare barcode field cannot.
 */
export const AddToStockRow = () => (
  <VStack gap={3} style={{alignItems: 'flex-start'}}>
    <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'flex-end'}}>
      <Typeahead
        label="Find a product"
        searchSource={productSource}
        value={PRODUCTS[0]}
        onChange={() => {}}
        placeholder="Search by name or barcode"
        debounceMs={0}
        width={300}
      />
      <Button label="Add to stock" variant="primary" />
    </HStack>
    <Text type="supporting">Barcode 6001068000456 · last sold at R 109.99</Text>
  </VStack>
);

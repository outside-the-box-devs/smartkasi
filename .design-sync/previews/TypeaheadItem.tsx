import {Typeahead, TypeaheadItem, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Stack';
import {CubeIcon, MapPinIcon, TagIcon} from '@heroicons/react/24/outline';
import {Icon} from '@astryxdesign/core/Icon';

interface ProductItem extends SearchableItem<{brand: string; price: string}> {}

const PRODUCTS: ProductItem[] = [
  {id: '1', label: 'Maize meal — Iwisa 10 kg', auxiliaryData: {brand: 'Iwisa', price: 'R 109.99'}},
  {id: '2', label: 'Cooking oil — Sunfoil 2 L', auxiliaryData: {brand: 'Sunfoil', price: 'R 74.50'}},
  {id: '3', label: 'Brown bread — Albany 700 g', auxiliaryData: {brand: 'Albany', price: 'R 18.99'}},
];

const SHOPS: SearchableItem[] = [
  {id: 's1', label: 'Thoko’s Spaza'},
  {id: 's2', label: 'Kasi Corner Store'},
  {id: 's3', label: 'Mama Ndlovu Tuck Shop'},
];

const productSource = createStaticSource<ProductItem>(PRODUCTS);

/**
 * The dropdown only exists while the owner types, so these are the rows a
 * Typeahead draws, lifted out of the popup to be readable standing still.
 * Label alone is the default row.
 */
export const PlainRows = () => (
  <Card>
    <VStack gap={1} style={{width: 320}}>
      {SHOPS.map((shop) => (
        <TypeaheadItem key={shop.id} item={shop} />
      ))}
    </VStack>
  </Card>
);

/**
 * `icon` and `description` are the two slots that make a row worth scanning:
 * the brand and price under the product name answer "is this the right one?"
 * without opening anything.
 */
export const RichRows = () => (
  <Card>
    <VStack gap={1} style={{width: 340}}>
      {PRODUCTS.map((product) => (
        <TypeaheadItem
          key={product.id}
          item={product}
          icon={<Icon icon={CubeIcon} />}
          description={`${product.auxiliaryData?.brand} · ${product.auxiliaryData?.price}`}
        />
      ))}
    </VStack>
  </Card>
);

/**
 * `group` heads a run of rows, and `isDisabled` dims one that cannot be
 * picked — a product the shop has not been licensed to sell.
 */
export const GroupedAndDisabled = () => (
  <Card>
    <VStack gap={1} style={{width: 340}}>
      <TypeaheadItem
        item={PRODUCTS[0]}
        group="On your shelf"
        icon={<Icon icon={TagIcon} />}
        description="24 in stock · R 109.99"
      />
      <TypeaheadItem
        item={PRODUCTS[1]}
        icon={<Icon icon={TagIcon} />}
        description="3 in stock · R 74.50"
      />
      <TypeaheadItem
        item={{id: 'x1', label: 'Castle Lager 340 ml'}}
        group="Needs a liquor licence"
        icon={<Icon icon={MapPinIcon} />}
        description="You cannot stock this yet"
        isDisabled
      />
    </VStack>
  </Card>
);

/**
 * The same component wired where it actually belongs — as the Typeahead's
 * `renderItem`. The closed field shows the chosen product as a token; the
 * rows above are what opens beneath it.
 */
export const InsideTypeahead = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <Typeahead
      label="Find a product"
      searchSource={productSource}
      value={PRODUCTS[0]}
      onChange={() => {}}
      placeholder="Search by name or barcode"
      debounceMs={0}
      width={340}
      renderItem={(item) => (
        <TypeaheadItem
          item={item}
          icon={<Icon icon={CubeIcon} />}
          description={`${item.auxiliaryData?.brand} · ${item.auxiliaryData?.price}`}
        />
      )}
    />
    <Badge variant="teal" label="renderItem draws each dropdown row" />
    <Text type="supporting">
      Open states do not render in a still preview — see the rows above for what
      the popup shows.
    </Text>
  </VStack>
);

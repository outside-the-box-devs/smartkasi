import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';

interface ShopRow extends Record<string, unknown> {
  id: string;
  name: string;
  township: string;
  licence: 'verified' | 'pending' | 'none';
  open: boolean;
}

const shops: ShopRow[] = [
  {id: '1', name: "Thoko's Spaza", township: 'Orlando East', licence: 'verified', open: true},
  {id: '2', name: 'Kasi Corner Store', township: 'Diepkloof', licence: 'pending', open: true},
  {id: '3', name: 'Mama Ndlovu Tuck Shop', township: 'Meadowlands', licence: 'none', open: false},
  {id: '4', name: 'Zola Fresh Produce', township: 'Zola', licence: 'verified', open: true},
];

const licenceLabel = {verified: 'Verified', pending: 'Under review', none: 'Not submitted'} as const;
const licenceVariant = {verified: 'success', pending: 'warning', none: 'neutral'} as const;

const shopColumns: TableColumn<ShopRow>[] = [
  {
    key: 'name',
    header: 'Shop',
    width: proportional(2),
    renderCell: (r) => <Text weight="semibold">{r.name}</Text>,
  },
  {
    key: 'township',
    header: 'Township',
    width: proportional(1),
    renderCell: (r) => <Text color="secondary">{r.township}</Text>,
  },
  {
    key: 'licence',
    header: 'Licence',
    width: pixel(150),
    renderCell: (r) => <Badge variant={licenceVariant[r.licence]} label={licenceLabel[r.licence]} />,
  },
  {
    key: 'open',
    header: 'Orders',
    width: pixel(130),
    // StatusDot's `label` is aria-only — it always needs a visible Text beside it.
    renderCell: (r) => (
      <HStack gap={2} style={{alignItems: 'center'}}>
        <StatusDot variant={r.open ? 'success' : 'neutral'} label={r.open ? 'Open' : 'Closed'} />
        <Text color={r.open ? 'primary' : 'secondary'}>{r.open ? 'Open' : 'Closed'}</Text>
      </HStack>
    ),
  },
];

/** The owner's shop list — status as dots and badges, never as coloured text. */
export const ShopsList = () => (
  <Table data={shops} columns={shopColumns} idKey="id" density="balanced" hasHover isStriped />
);

interface StockRow extends Record<string, unknown> {
  id: string;
  product: string;
  detail: string;
  price: string;
  qty: number;
  low: boolean;
}

const stock: StockRow[] = [
  {id: '1', product: 'Maize meal', detail: 'Iwisa · 10 kg', price: 'R 109.99', qty: 24, low: false},
  {id: '2', product: 'Cooking oil', detail: 'Sunfoil · 2 L', price: 'R 74.50', qty: 3, low: true},
  {id: '3', product: 'Brown bread', detail: 'Albany · 700 g', price: 'R 18.99', qty: 11, low: false},
  {id: '4', product: 'Paraffin', detail: 'Blue · 1 L', price: 'R 32.00', qty: 2, low: true},
];

const stockColumns: TableColumn<StockRow>[] = [
  {
    key: 'product',
    header: 'Product',
    width: proportional(2),
    renderCell: (r) => (
      <VStack gap={1}>
        <Text weight="semibold">{r.product}</Text>
        <Text type="supporting">{r.detail}</Text>
      </VStack>
    ),
  },
  {
    key: 'price',
    header: 'Your price',
    width: pixel(130),
    renderCell: (r) => <Text hasTabularNumbers>{r.price}</Text>,
  },
  {
    key: 'qty',
    header: 'In stock',
    width: pixel(140),
    renderCell: (r) => (
      <HStack gap={2} style={{alignItems: 'center'}}>
        <Text hasTabularNumbers>{r.qty}</Text>
        {r.low && <Badge variant="warning" label="Low" />}
      </HStack>
    ),
  },
];

/** Stock on hand — money and counts use tabular figures so columns line up. */
export const StockOnHand = () => (
  <Table data={stock} columns={stockColumns} idKey="id" density="balanced" hasHover />
);

/** Density controls how much fits on one screen behind the counter. */
export const Densities = () => (
  <VStack gap={5}>
    <VStack gap={2}>
      <Text type="label">Compact</Text>
      <Table data={stock.slice(0, 3)} columns={stockColumns} idKey="id" density="compact" />
    </VStack>
    <VStack gap={2}>
      <Text type="label">Spacious</Text>
      <Table data={stock.slice(0, 3)} columns={stockColumns} idKey="id" density="spacious" />
    </VStack>
  </VStack>
);

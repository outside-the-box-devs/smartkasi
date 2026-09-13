import {Pagination} from '@astryxdesign/core/Pagination';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

/**
 * Below the shops table: 43 shops across the townships SmartKasi covers, ten
 * to a page, with the page numbers an owner can jump straight to.
 */
export const ShopsTablePages = () => (
  <Pagination page={2} onChange={() => {}} totalItems={43} pageSize={10} variant="pages" label="Shops pagination" />
);

/**
 * `count` names the range in the current view — right when the total matters
 * more than jumping to a specific page, and pairs with a page size selector.
 */
export const CountWithPageSize = () => (
  <Pagination
    page={3}
    onChange={() => {}}
    totalItems={112}
    pageSize={20}
    pageSizeOptions={[10, 20, 50]}
    onPageSizeChange={() => {}}
    variant="count"
    label="Sales history pagination"
  />
);

/** `compact` fits a narrow phone screen below the day's sales list. */
export const CompactOnPhone = () => (
  <VStack gap={2} style={{width: 260}}>
    <Text type="label">Today&apos;s sales</Text>
    <Pagination page={1} onChange={() => {}} totalItems={37} pageSize={10} variant="compact" size="sm" label="Sales pagination" />
  </VStack>
);

/** `dots` suits a small, fixed count — here the five photos on a flyer draft. */
export const DotsForFlyerPhotos = () => (
  <Pagination page={2} onChange={() => {}} totalPages={5} variant="dots" label="Flyer photo pagination" />
);

/**
 * `input` lets the owner type a page number directly — useful once a table
 * runs past the ~10 pages the numbered variant stays legible for.
 */
export const InputVariant = () => (
  <Pagination
    page={14}
    onChange={() => {}}
    totalItems={640}
    pageSize={10}
    variant="input"
    pageLabel="Page"
    label="Catalogue pagination"
  />
);

/** Sizes, and cursor-based paging where the total is unknown — `hasMore` only. */
export const SizesAndCursorPaging = () => (
  <VStack gap={4} style={{alignItems: 'flex-start'}}>
    <Pagination page={1} onChange={() => {}} totalItems={43} pageSize={10} size="sm" label="Shops pagination (sm)" />
    <Pagination page={1} onChange={() => {}} totalItems={43} pageSize={10} size="md" label="Shops pagination (md)" />
    <Pagination page={2} onChange={() => {}} hasMore variant="compact" label="Order history pagination" />
  </VStack>
);

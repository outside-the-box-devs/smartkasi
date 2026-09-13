import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {BuildingStorefrontIcon, MagnifyingGlassIcon, CubeIcon} from '@heroicons/react/24/outline';

/** First-time setup — no shops yet, one clear next step. */
export const NoShopsYet = () => (
  <EmptyState
    icon={<Icon icon={BuildingStorefrontIcon} size="lg" />}
    title="No shops yet"
    description="Add your first one to get started — takes about a minute."
    actions={<Button variant="primary" label="Add a shop" />}
  />
);

/** Empty stock list for a brand-new shop, before any products are captured. */
export const NoStockYet = () => (
  <EmptyState
    icon={<Icon icon={CubeIcon} size="lg" />}
    title="No stock yet"
    description="Add products so customers can see what Thoko's Spaza has on the shelf."
    actions={<Button variant="primary" label="Add a product" />}
  />
);

/** Zero search results — a filter to clear rather than content to create. */
export const NoSearchResults = () => (
  <EmptyState
    icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
    title="No products match &ldquo;paraffin heater&rdquo;"
    description="Try a different search term or clear your filters."
    actions={<Button variant="secondary" label="Clear filters" />}
  />
);

/** Compact variant for a constrained panel, like a sidebar or a card. */
export const CompactInsideCard = () => (
  <EmptyState
    title="No orders today"
    description="New orders from customers will appear here."
    isCompact
  />
);

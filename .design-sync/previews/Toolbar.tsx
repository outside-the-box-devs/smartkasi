import {Toolbar} from '@astryxdesign/core/Toolbar';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack} from '@astryxdesign/core/Stack';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Above the shops table: view tabs on the left, filter and the primary action
 * on the right. Toolbar cascades `size="sm"` to every child automatically.
 */
export const ShopsTableToolbar = () => (
  <Toolbar
    label="Shops table actions"
    size="sm"
    dividers={['bottom']}
    startContent={
      <TabList value="all" onChange={() => {}} label="Filter shops">
        <Tab value="all" label="All shops" />
        <Tab value="review" label="Under review" />
      </TabList>
    }
    endContent={
      <Selector
        label="Sort by"
        isLabelHidden
        placeholder="Sort by"
        size="sm"
        variant="ghost"
        options={['Newest', 'Name A–Z', 'Most stock']}
        value="Newest"
        onChange={() => {}}
      />
    }
  />
);

/**
 * As a card header, per the best practice: a title with an interactive
 * search box, rather than a plain LayoutHeader with nothing to click.
 */
export const CardHeaderWithSearch = () => (
  <Toolbar
    label="Stock on hand actions"
    size="sm"
    dividers={['bottom']}
    startContent={<Heading level={5}>Stock on hand</Heading>}
    endContent={
      <>
        <TextInput
          label="Search stock"
          isLabelHidden
          size="sm"
          placeholder="Search products"
          startIcon={MagnifyingGlassIcon}
          value=""
          onChange={() => {}}
        />
        <Button label="Add to stock" variant="primary" size="sm" icon={<BuildingStorefrontIcon />} />
      </>
    }
  />
);

/**
 * A contextual bulk-action bar — visually distinct with `variant="muted"` so
 * it reads as temporary, not part of the page chrome underneath it.
 */
export const BulkSelectionBar = () => (
  <Toolbar
    label="Bulk stock actions"
    size="sm"
    variant="muted"
    dividers={['bottom']}
    startContent={
      <Text weight="semibold">3 products selected</Text>
    }
    endContent={
      <>
        <Button label="Mark as low stock" size="sm" />
        <IconButton variant="destructive" size="sm" icon={<TrashIcon />} label="Remove selected" tooltip="Remove selected" />
        <IconButton variant="ghost" size="sm" icon={<XMarkIcon />} label="Clear selection" tooltip="Clear selection" />
      </>
    }
  />
);

/** `centerContent` switches the layout to a three-slot grid — a status pinned mid-bar. */
export const WithCenterContent = () => (
  <Toolbar
    label="Sync status"
    size="sm"
    dividers={['bottom']}
    startContent={<Button label="Back to shops" variant="ghost" size="sm" />}
    centerContent={<Badge variant="warning" label="3 sales waiting to sync" />}
    endContent={<Button label="Sync now" variant="primary" size="sm" />}
  />
);

/** Sizes cascade to every child — set once on the toolbar, never per button. */
export const Sizes = () => (
  <VStack gap={4} style={{width: 380}}>
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <Toolbar
        key={size}
        label={`Stock actions (${size})`}
        size={size}
        variant="section"
        startContent={<Text type="label">{size}</Text>}
        endContent={<Button label="Add to stock" variant="primary" size={size} />}
      />
    ))}
  </VStack>
);

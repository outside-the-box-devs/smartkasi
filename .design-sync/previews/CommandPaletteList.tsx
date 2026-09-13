import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';

const shortList = [
  {id: 'thokos', label: "Thoko's Spaza"},
  {id: 'kasi', label: 'Kasi Corner Store'},
];

/** The scrollable listbox with a short result set. */
export const ShortResultList = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search shops"
    searchSource={createStaticSource(shortList)}
  />
);

const longList = Array.from({length: 12}, (_, i) => ({
  id: `product-${i}`,
  label: `Product ${i + 1} of 12 — restock candidate`,
}));

/** A long result set — the list area scrolls inside a fixed max height. */
export const ScrollingResultList = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search products"
    searchSource={createStaticSource(longList)}
    maxHeight={320}
  />
);

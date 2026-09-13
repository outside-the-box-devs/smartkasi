import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';

interface Command extends SearchableItem {
  auxiliaryData?: {group?: string};
}

const shopCommands: Command[] = [
  {id: 'thokos', label: "Thoko's Spaza", auxiliaryData: {group: 'Shops'}},
  {id: 'kasi', label: 'Kasi Corner Store', auxiliaryData: {group: 'Shops'}},
  {id: 'maize', label: 'Maize meal — Iwisa 10kg', auxiliaryData: {group: 'Products'}},
  {id: 'oil', label: 'Cooking oil — Sunfoil 2L', auxiliaryData: {group: 'Products'}},
  {id: 'add-shop', label: 'Add a shop', auxiliaryData: {group: 'Actions'}},
];

/** The launcher an owner opens to jump to a shop, a product, or an action. */
export const ShopSearch = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(shopCommands)}
  />
);

const emptyCommands: Command[] = [];

/** Nothing matches yet — the built-in empty-bootstrap state. */
export const NoBootstrapResults = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(emptyCommands)}
    emptyBootstrapText="Start typing to search shops, products, or actions"
  />
);

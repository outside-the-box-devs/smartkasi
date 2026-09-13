import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';

interface Command extends SearchableItem {
  auxiliaryData: {group: string};
}

const shopsAndProducts: Command[] = [
  {id: 'thokos', label: "Thoko's Spaza", auxiliaryData: {group: 'Shops'}},
  {id: 'kasi', label: 'Kasi Corner Store', auxiliaryData: {group: 'Shops'}},
  {id: 'maize', label: 'Maize meal — Iwisa 10kg', auxiliaryData: {group: 'Products'}},
  {id: 'oil', label: 'Cooking oil — Sunfoil 2L', auxiliaryData: {group: 'Products'}},
  {id: 'bread', label: 'Brown bread — Albany 700g', auxiliaryData: {group: 'Products'}},
];

/** Results auto-group by auxiliaryData.group — Shops, then Products. */
export const ShopsAndProductGroups = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(shopsAndProducts)}
  />
);

const actionsAndRecents: Command[] = [
  {id: 'add-shop', label: 'Add a shop', auxiliaryData: {group: 'Actions'}},
  {id: 'add-product', label: 'Add a product', auxiliaryData: {group: 'Actions'}},
  {id: 'recent-1', label: "Thoko's Spaza — Stock", auxiliaryData: {group: 'Recently viewed'}},
  {id: 'recent-2', label: 'Orders — Diepkloof', auxiliaryData: {group: 'Recently viewed'}},
];

/** A second grouping shape: quick actions ahead of recently-viewed pages. */
export const ActionsAndRecents = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(actionsAndRecents)}
  />
);

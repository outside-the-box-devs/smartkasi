import {CommandPalette, CommandPaletteEmpty} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {Card} from '@astryxdesign/core/Card';

const noShops: {id: string; label: string}[] = [];

/** A brand-new account: bootstrap() returns nothing, so the palette shows its empty state. */
export const NoShopsYet = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(noShops)}
    emptyBootstrapText="Add your first shop to start searching it here"
  />
);

/** The bare component, as it renders for a query with zero matches. */
export const NoMatchesForQuery = () => (
  <Card width={360} padding={0}>
    <CommandPaletteEmpty>No results for &quot;paraffin&quot;</CommandPaletteEmpty>
  </Card>
);

import {CommandPalette, CommandPaletteFooter} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {Text} from '@astryxdesign/core/Text';

const commands = [
  {id: 'thokos', label: "Thoko's Spaza"},
  {id: 'kasi', label: 'Kasi Corner Store'},
];

/** The default footer — built-in keyboard hints via Kbd. */
export const DefaultKeyboardHints = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(commands)}
  />
);

/** A custom footer replacing the hints with result context. */
export const CustomResultCount = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(commands)}
    footer={
      <CommandPaletteFooter>
        <Text type="supporting">2 shops match &quot;spaza&quot;</Text>
      </CommandPaletteFooter>
    }
  />
);

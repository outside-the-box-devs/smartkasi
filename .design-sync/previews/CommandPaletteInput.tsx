import {CommandPalette, CommandPaletteInput} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {Kbd} from '@astryxdesign/core/Kbd';

const commands = [
  {id: 'thokos', label: "Thoko's Spaza"},
  {id: 'kasi', label: 'Kasi Corner Store'},
  {id: 'orlando', label: 'Orlando East'},
];

/** The default input slot — placeholder text and search icon come for free. */
export const DefaultInput = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(commands)}
  />
);

/** A custom placeholder and a shortcut hint in the trailing slot. */
export const CustomPlaceholderWithShortcut = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search SmartKasi"
    searchSource={createStaticSource(commands)}
    input={
      <CommandPaletteInput
        placeholder="Search your shops..."
        endContent={<Kbd keys="escape" />}
      />
    }
  />
);

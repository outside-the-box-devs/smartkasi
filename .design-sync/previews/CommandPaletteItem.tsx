import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';

interface ShopItem {
  id: string;
  label: string;
  township: string;
}

const shops: ShopItem[] = [
  {id: 'thokos', label: "Thoko's Spaza", township: 'Orlando East'},
  {id: 'kasi', label: 'Kasi Corner Store', township: 'Diepkloof'},
  {id: 'zola', label: 'Zola Fresh Produce', township: 'Zola'},
];

/** Plain items — the default label-only rendering. */
export const PlainItems = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search shops"
    searchSource={createStaticSource(shops)}
  />
);

/** Custom renderItem — shop name plus township, still one real CommandPaletteItem per row. */
export const ShopNameAndTownship = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    label="Search shops"
    searchSource={createStaticSource(shops)}
    renderItem={(item) => (
      <VStack gap={0}>
        <Text weight="semibold">{item.label}</Text>
        <Text type="supporting">{(item as ShopItem).township}</Text>
      </VStack>
    )}
  />
);

/** Picker mode — the current value shows a check mark on its row. */
export const CurrentSelectionChecked = () => (
  <CommandPalette
    isOpen
    isInline
    onOpenChange={() => {}}
    value="kasi"
    label="Switch shop"
    searchSource={createStaticSource(shops)}
    renderItem={(item, isSelected) => (
      <HStack gap={2} style={{justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
        <Text weight={isSelected ? 'semibold' : undefined}>{item.label}</Text>
        {isSelected && <Icon icon="check" color="accent" label="Current shop" />}
      </HStack>
    )}
  />
);

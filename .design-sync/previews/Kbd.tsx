import {Kbd} from '@astryxdesign/core/Kbd';
import {Text} from '@astryxdesign/core/Text';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Stack';

/**
 * Till shortcuts for the owner who runs SmartKasi on a laptop behind the
 * counter. A shortcut is always shown next to the action it triggers — never
 * as the only way to find it, because most of the till is a touchscreen.
 */
export const TillShortcuts = () => (
  <VStack gap={3} style={{width: 320}}>
    <Text type="label">Keyboard shortcuts</Text>
    <Divider />
    {[
      {action: 'Scan or type a barcode', keys: 'mod+b'},
      {action: 'Complete sale', keys: 'mod+enter'},
      {action: 'Clear the till', keys: 'escape'},
      {action: 'Sync saved sales', keys: 'mod+shift+s'},
    ].map((row) => (
      <HStack key={row.keys} gap={4} style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <Text>{row.action}</Text>
        <Kbd keys={row.keys} />
      </HStack>
    ))}
  </VStack>
);

/**
 * Single keys. `mod` is the one to reach for — it draws ⌘ on a Mac and Ctrl
 * everywhere else, so the same string is right on both.
 */
export const SingleKeys = () => (
  <VStack gap={4}>
    <VStack gap={2}>
      <Text type="label">Modifiers and actions</Text>
      <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'center'}}>
        <Kbd keys="mod" />
        <Kbd keys="shift" />
        <Kbd keys="alt" />
        <Kbd keys="enter" />
        <Kbd keys="escape" />
        <Kbd keys="tab" />
        <Kbd keys="backspace" />
      </HStack>
    </VStack>
    <VStack gap={2}>
      <Text type="label">Arrows</Text>
      <HStack gap={3} style={{alignItems: 'center'}}>
        <Kbd keys="up" />
        <Kbd keys="down" />
        <Kbd keys="left" />
        <Kbd keys="right" />
      </HStack>
    </VStack>
  </VStack>
);

/**
 * Combinations: join keys with "+". One Kbd renders the whole chord as
 * adjacent caps with no separator between them — so give each chord its own
 * row, never a flat line of them, or the reader cannot tell where one ends.
 */
export const Combinations = () => (
  <VStack gap={3} style={{width: 300}}>
    {[
      {keys: 'mod+k', what: 'Search everything'},
      {keys: 'mod+enter', what: 'Complete sale'},
      {keys: 'mod+shift+s', what: 'Sync saved sales'},
      {keys: 'alt+down', what: 'Next product in the list'},
    ].map((row) => (
      <HStack key={row.keys} gap={4} style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <Text type="supporting">{row.what}</Text>
        <Kbd keys={row.keys} />
      </HStack>
    ))}
  </VStack>
);

/** Inline in a sentence, where the shortcut supplements a visible control. */
export const InHelpText = () => (
  <VStack gap={3} style={{width: 340}}>
    <HStack gap={2} style={{alignItems: 'center', flexWrap: 'wrap'}}>
      <Text type="supporting">Press</Text>
      <Kbd keys="mod+b" />
      <Text type="supporting">to jump to the barcode box.</Text>
    </HStack>
    <HStack gap={2} style={{alignItems: 'center', flexWrap: 'wrap'}}>
      <Text type="supporting">Finished? </Text>
      <Kbd keys="mod+enter" />
      <Text type="supporting">rings up the sale.</Text>
    </HStack>
  </VStack>
);

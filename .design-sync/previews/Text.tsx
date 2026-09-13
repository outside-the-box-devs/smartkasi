import {Text, Heading} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Stack';

/** The semantic type scale, top to bottom. Pick a type; let the theme size it. */
export const TypeScale = () => (
  <VStack gap={3}>
    <Text type="display-1">Takings today</Text>
    <Text type="display-3">R 4 820.50</Text>
    <Text type="large">Thoko&apos;s Spaza, Orlando East</Text>
    <Text type="body">
      Every sale is written to this device before it is sent, so the till keeps
      working when the signal drops.
    </Text>
    <Text type="label">Cash received</Text>
    <Text type="supporting">Syncs automatically when you are back online</Text>
    <Text type="code">client_sale_id 8f2c-41ab</Text>
  </VStack>
);

/** Heading renders the right h1–h6 element for the document outline. */
export const Headings = () => (
  <VStack gap={2}>
    <Heading level={1}>Your shops</Heading>
    <Heading level={2}>Orlando East</Heading>
    <Heading level={3}>Stock on hand</Heading>
    <Heading level={4}>Items running low</Heading>
  </VStack>
);

/** Colour carries meaning: primary reads first, supporting recedes. */
export const Colours = () => (
  <VStack gap={2}>
    <Text color="primary">Maize meal 10kg — in stock</Text>
    <Text color="secondary">Brand: Iwisa · 10 kg</Text>
    <Text color="disabled">Discontinued line</Text>
    <Text color="accent">View all 24 products</Text>
  </VStack>
);

/**
 * hasTabularNumbers aligns digits down a column — the rule for any money in
 * the till, where a misaligned total is a miscounted float.
 */
export const MoneyColumn = () => (
  <VStack gap={2}>
    <Text type="label">Today&apos;s sales</Text>
    {['R 1 240.00', 'R 86.50', 'R 4 820.50', 'R 312.75'].map((amount) => (
      <HStack key={amount} gap={6} style={{justifyContent: 'space-between', width: 220}}>
        <Text color="secondary">Sale</Text>
        <Text hasTabularNumbers weight="semibold">
          {amount}
        </Text>
      </HStack>
    ))}
  </VStack>
);

/** maxLines truncates long copy and keeps the row height predictable. */
export const Truncation = () => (
  <VStack gap={3} style={{width: 280}}>
    <Text maxLines={1}>
      Iwisa Super Maize Meal 10kg — special price until end of month
    </Text>
    <Text maxLines={2} color="secondary">
      Customers within two kilometres see this promotion on the flyers tab of
      your shop page, and couriers on foot can still reach them.
    </Text>
  </VStack>
);

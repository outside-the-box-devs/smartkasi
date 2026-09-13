import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Stack';

/**
 * The shop profile form: a one-line field for the name, a TextArea for the
 * only genuinely multi-line answer. `maxLength` puts a live counter in the
 * corner so the owner sees the limit before they hit Save.
 */
export const ShopProfileForm = () => (
  <VStack gap={4} style={{width: 380}}>
    <TextInput label="Shop name" value="Kasi Corner Store" onChange={() => {}} isRequired />
    <TextArea
      label="What you sell"
      value="Bread, milk, airtime and cold drinks. Open from 6am every day, including Sundays. We keep paraffin behind the counter — just ask."
      onChange={() => {}}
      description="Customers within two kilometres see this on your shop page"
      rows={4}
      maxLength={280}
    />
    <HStack gap={2}>
      <Button label="Save shop details" variant="primary" />
      <Button label="Cancel" variant="ghost" />
    </HStack>
  </VStack>
);

/** Empty with a placeholder, and filled. The label stays visible in both. */
export const EmptyAndFilled = () => (
  <VStack gap={5} style={{width: 380}}>
    <TextArea
      label="Directions to your shop"
      value=""
      onChange={() => {}}
      placeholder="Second street past the taxi rank, next to the blue container"
      rows={3}
      isOptional
    />
    <TextArea
      label="Directions to your shop"
      value="Second street past the taxi rank, next to the blue container. Delivery bikes can park at the gate."
      onChange={() => {}}
      rows={3}
    />
  </VStack>
);

/**
 * Status types, each with the message that earns the colour. Never ship the
 * coloured border on its own — the message is the part that helps.
 */
export const Validation = () => (
  <VStack gap={6} style={{width: 380}}>
    <TextArea
      label="Why are you appealing?"
      value="."
      onChange={() => {}}
      rows={2}
      status={{type: 'error', message: 'Tell us what happened in a sentence or two'}}
      statusVariant="detached"
    />
    <TextArea
      label="What you sell"
      value="Everything. Come and see."
      onChange={() => {}}
      rows={2}
      status={{type: 'warning', message: 'Shops that list their products get more visits'}}
      statusVariant="detached"
    />
    <TextArea
      label="What you sell"
      value="Bread, milk, airtime, cold drinks, paraffin and sweets."
      onChange={() => {}}
      rows={2}
      status={{type: 'success', message: 'Saved on this device'}}
      statusVariant="detached"
    />
  </VStack>
);

/**
 * Read-only, disabled and loading. Read-only stays at full opacity because the
 * text still matters; disabled dims and says why through `disabledMessage`.
 */
export const FieldStates = () => (
  <VStack gap={4} style={{width: 380}}>
    <TextArea
      label="Note from the reviewer"
      value="Trading licence photo is too blurry to read the expiry date. Please take a new photo in daylight."
      onChange={() => {}}
      rows={3}
      isReadOnly
    />
    <TextArea
      label="What you sell"
      value="Bread, milk, airtime and cold drinks."
      onChange={() => {}}
      rows={2}
      isDisabled
      disabledMessage="You can edit this once your licence is verified"
    />
    <TextArea
      label="Message to the wholesaler"
      value="Please hold ten cases of Iwisa for collection on Friday."
      onChange={() => {}}
      rows={2}
      isLoading
    />
  </VStack>
);

/**
 * `size` changes padding; `rows` changes height. They are separate dials, so a
 * compact field can still be four lines tall.
 */
export const SizeAndRows = () => (
  <VStack gap={4} style={{width: 380}}>
    <TextArea
      size="sm"
      label="Short note on this sale"
      value="Customer paid with a R200 note."
      onChange={() => {}}
      rows={2}
    />
    <TextArea
      size="lg"
      label="Stocktake notes"
      value="Two cases of cooking oil damaged in the storeroom — written off."
      onChange={() => {}}
      rows={2}
    />
  </VStack>
);

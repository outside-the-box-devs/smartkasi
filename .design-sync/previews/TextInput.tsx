import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {MagnifyingGlassIcon, PhoneIcon} from '@heroicons/react/24/outline';

/**
 * The "Add to stock" row exactly as `InventoryPanel` ships it: two fields and
 * the action, bottom-aligned so the button sits on the input baseline, not the
 * label. This is the composition to copy — a bare input is rarely the unit.
 */
export const AddToStockRow = () => (
  <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'flex-end'}}>
    <TextInput
      label="Product barcode"
      value="6001068000456"
      onChange={() => {}}
      placeholder="Scan or type the barcode"
      htmlName="barcode"
    />
    <TextInput
      label="Selling price (R)"
      value="85.00"
      onChange={() => {}}
      placeholder="85.00"
      htmlName="price"
      width={140}
    />
    <Button label="Add to stock" variant="primary" type="submit" />
  </HStack>
);

/**
 * Size the field to the answer, not the page. A phone number needs less room
 * than a shop name, and a mid-range Android keyboard covers half the screen.
 */
export const Sizes = () => (
  <VStack gap={4} style={{width: 320}}>
    <TextInput
      size="sm"
      label="Postal code"
      value="1804"
      onChange={() => {}}
      width={120}
    />
    <TextInput
      size="md"
      label="Township"
      value="Orlando East"
      onChange={() => {}}
    />
    <TextInput
      size="lg"
      label="Shop name"
      value={'Thoko’s Spaza'}
      onChange={() => {}}
    />
  </VStack>
);

/**
 * Validation says what to fix, never just "invalid". `detached` keeps the
 * message from overlapping the next field in a stacked form.
 */
export const Validation = () => (
  <VStack gap={5} style={{width: 320}}>
    <TextInput
      label="Owner phone"
      value="082 41"
      onChange={() => {}}
      startIcon={PhoneIcon}
      status={{type: 'error', message: 'Phone number needs 10 digits'}}
      statusVariant="detached"
    />
    <TextInput
      label="Selling price (R)"
      value="4.00"
      onChange={() => {}}
      status={{type: 'warning', message: 'That is below what you paid for it'}}
      statusVariant="detached"
    />
    <TextInput
      label="Product barcode"
      value="6001068000456"
      onChange={() => {}}
      status={{type: 'success', message: 'Iwisa Maize Meal 10 kg'}}
      statusVariant="detached"
    />
  </VStack>
);

/**
 * Required, optional, read-only, disabled and loading — the states a shop
 * owner meets while their licence is being checked. `disabledMessage` is how a
 * disabled field explains itself; a wrapping Tooltip would never fire.
 */
export const FieldStates = () => (
  <VStack gap={4} style={{width: 320}}>
    <TextInput
      label="Shop name"
      value="Kasi Corner Store"
      onChange={() => {}}
      isRequired
    />
    <TextInput
      label="Second phone"
      value=""
      onChange={() => {}}
      placeholder="082 000 0000"
      isOptional
    />
    <TextInput
      label="Shop ID"
      value="shp_8f2c41ab"
      onChange={() => {}}
      isReadOnly
      description="Quote this when you call support"
    />
    <TextInput
      label="Registered trading name"
      value={'Thoko’s Spaza CC'}
      onChange={() => {}}
      isDisabled
      disabledMessage="Locked while your trading licence is under review"
    />
    <TextInput
      label="Product barcode"
      value="6009803152470"
      onChange={() => {}}
      isLoading
      description="Looking this up in the catalogue"
    />
  </VStack>
);

/**
 * Search is the one field allowed to hide its label: the magnifier and the
 * placeholder carry the meaning. `hasClear` resets a filter in one tap.
 */
export const ShopSearch = () => (
  <VStack gap={2} style={{width: 320}}>
    <TextInput
      label="Search shops"
      isLabelHidden
      value="Orlando"
      onChange={() => {}}
      placeholder="Search by name, township or city"
      startIcon={MagnifyingGlassIcon}
      hasClear
    />
    <Text type="supporting">4 shops match &ldquo;Orlando&rdquo;</Text>
  </VStack>
);

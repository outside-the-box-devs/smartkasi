import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {BanknotesIcon} from '@heroicons/react/24/outline';

/**
 * Restocking at the counter: a whole-number count with steppers, so a thumb on
 * a mid-range Android can add one case without opening the keyboard.
 */
export const RestockRow = () => (
  <HStack gap={3} style={{flexWrap: 'wrap', alignItems: 'flex-end'}}>
    <NumberInput
      label="Quantity in stock"
      value={24}
      onChange={() => {}}
      min={0}
      max={999}
      step={1}
      isIntegerOnly
      hasNumberSteppers
      width={180}
    />
    <Button label="Add to stock" variant="primary" />
  </HStack>
);

/**
 * Money: two decimals, a leading note icon, and rands rendered by
 * `formatValue` when the field is not being typed into.
 */
export const SellingPrice = () => (
  <VStack gap={4} style={{width: 280}}>
    <NumberInput
      label="Selling price"
      value={85}
      onChange={() => {}}
      min={0}
      step={0.5}
      startIcon={BanknotesIcon}
      formatValue={(v) => `R ${v.toFixed(2)}`}
      description="What the customer pays at the till"
    />
    <NumberInput
      label="Cash received"
      value={100}
      onChange={() => {}}
      min={0}
      step={5}
      formatValue={(v) => `R ${v.toFixed(2)}`}
      hasClear
    />
    <Text type="supporting">Change to give: R 15.00</Text>
  </VStack>
);

/**
 * `units` names what the number is without stealing label space — useful for
 * the margin and reorder settings on a product.
 */
export const WithUnits = () => (
  <VStack gap={4} style={{width: 280}}>
    <NumberInput
      label="Mark-up"
      value={18}
      onChange={() => {}}
      min={0}
      max={100}
      units="%"
      hasNumberSteppers
    />
    <NumberInput
      label="Warn me below"
      value={5}
      onChange={() => {}}
      min={0}
      units="units"
      isIntegerOnly
      hasNumberSteppers
      description="We flag the product as running low at this count"
    />
  </VStack>
);

/** Out-of-range, soft-warning and confirmed values, each with its message. */
export const Validation = () => (
  <VStack gap={6} style={{width: 280}}>
    <NumberInput
      label="Quantity in stock"
      value={-2}
      onChange={() => {}}
      min={0}
      status={{type: 'error', message: 'Stock cannot go below zero'}}
      statusVariant="detached"
    />
    <NumberInput
      label="Selling price"
      value={4}
      onChange={() => {}}
      min={0}
      formatValue={(v) => `R ${v.toFixed(2)}`}
      status={{type: 'warning', message: 'Less than you paid — check the price'}}
      statusVariant="detached"
    />
    <NumberInput
      label="Cash received"
      value={200}
      onChange={() => {}}
      min={0}
      formatValue={(v) => `R ${v.toFixed(2)}`}
      status={{type: 'success', message: 'Covers the R 187.49 total'}}
      statusVariant="detached"
    />
  </VStack>
);

/** Sizes, plus required, read-only and disabled-with-a-reason. */
export const SizesAndStates = () => (
  <VStack gap={4} style={{width: 280}}>
    <NumberInput size="sm" label="Cases" value={3} onChange={() => {}} hasNumberSteppers />
    <NumberInput size="lg" label="Quantity in stock" value={24} onChange={() => {}} isRequired hasNumberSteppers />
    <NumberInput
      label="Units per case"
      value={12}
      onChange={() => {}}
      isReadOnly
      description="Set by the wholesaler"
    />
    <NumberInput
      label="Quantity in stock"
      value={0}
      onChange={() => {}}
      isDisabled
      disabledMessage="Add this product to your shop before setting stock"
    />
  </VStack>
);

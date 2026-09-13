import {BottomSheetSwitcher, BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

/** Step 1 of "Add a shop" — the details step is active. */
export const AddShopDetailsStep = () => (
  <BottomSheetSwitcher activeSheet="details" onActiveSheetChange={() => {}}>
    <BottomSheet sheetId="details" label="Shop details" height="hug">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Shop details</Heading>
          <Text type="body" color="secondary">
            Name and township for your new shop.
          </Text>
          <Text type="supporting">Step 1 of 3</Text>
          <Button variant="primary" label="Continue" />
        </VStack>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="licence" label="Trading licence" height="hug">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Trading licence</Heading>
          <Text type="body" color="secondary">
            Upload or submit later — Kasi Corner Store can trade while under
            review.
          </Text>
        </VStack>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm" height="hug">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Ready to save</Heading>
          <Text type="body">Everything looks good.</Text>
        </VStack>
      </Section>
    </BottomSheet>
  </BottomSheetSwitcher>
);

/** Step 2 — the flow has moved on to the licence step, in the same shared dialog. */
export const AddShopLicenceStep = () => (
  <BottomSheetSwitcher activeSheet="licence" onActiveSheetChange={() => {}}>
    <BottomSheet sheetId="details" label="Shop details" height="hug">
      <Section padding={4}>
        <Text type="body">Shop details</Text>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="licence" label="Trading licence" height="hug" purpose="form">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Trading licence</Heading>
          <Text type="body" color="secondary">
            Upload a photo of your trading licence, or skip and submit it
            later from the Licence tab.
          </Text>
          <Text type="supporting">Step 2 of 3</Text>
          <Button variant="primary" label="Continue" />
        </VStack>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm" height="hug">
      <Section padding={4}>
        <Text type="body">Confirm</Text>
      </Section>
    </BottomSheet>
  </BottomSheetSwitcher>
);

/** Step 3 — final confirmation before the shop is created. */
export const AddShopConfirmStep = () => (
  <BottomSheetSwitcher activeSheet="confirm" onActiveSheetChange={() => {}}>
    <BottomSheet sheetId="details" label="Shop details" height="hug">
      <Section padding={4}>
        <Text type="body">Shop details</Text>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="licence" label="Trading licence" height="hug">
      <Section padding={4}>
        <Text type="body">Trading licence</Text>
      </Section>
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm new shop" height="hug" purpose="required">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Ready to save Zola Fresh Produce</Heading>
          <Text type="body" color="secondary">
            Zola · Full store · licence not yet submitted.
          </Text>
          <Text type="supporting">Step 3 of 3</Text>
          <Button variant="primary" label="Create shop" />
        </VStack>
      </Section>
    </BottomSheet>
  </BottomSheetSwitcher>
);

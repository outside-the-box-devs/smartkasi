import {FileInput} from '@astryxdesign/core/FileInput';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

// Previews render statically, so the "chosen file" is a real File built in
// memory — the component needs a File, not a name string.
const licenceFile = new File(['licence'], 'trading-licence-2026.pdf', {type: 'application/pdf'});
const shopFront = new File(['photo'], 'shop-front.jpg', {type: 'image/jpeg'});

/**
 * Uploading the trading licence — the one document SmartKasi asks a shop
 * owner for. `dropzone` is the default choice: it is a bigger target for a
 * thumb, and it takes a drag on a laptop.
 */
export const TradingLicenceUpload = () => (
  <VStack gap={3} style={{width: 380}}>
    <FileInput
      label="Trading licence"
      mode="dropzone"
      value={null}
      onChange={() => {}}
      accept=".pdf,image/*"
      maxSize={5 * 1024 * 1024}
      description="A photo or PDF of your municipal trading licence, up to 5 MB"
      isRequired
    />
    <Button label="Send for review" variant="primary" />
  </VStack>
);

/** Dropzone with a file already chosen, so the name and clear button show. */
export const FileChosen = () => (
  <VStack gap={4} style={{width: 380}}>
    <FileInput
      label="Trading licence"
      mode="dropzone"
      value={licenceFile}
      onChange={() => {}}
      accept=".pdf,image/*"
      description="A photo or PDF of your municipal trading licence"
    />
    <Text type="supporting">Sent for review on 8 September — usually three working days.</Text>
  </VStack>
);

/**
 * `input` mode is the compact form: one row, for a secondary attachment that
 * does not deserve a whole panel.
 */
export const CompactInputMode = () => (
  <VStack gap={4} style={{width: 380}}>
    <FileInput
      label="Photo of the shop front"
      mode="input"
      value={shopFront}
      onChange={() => {}}
      accept="image/*"
      description="Shown to customers on your shop page"
      isOptional
    />
    <FileInput
      label="Supplier invoices"
      mode="input"
      value={null}
      onChange={() => {}}
      accept=".pdf"
      isMultiple
      maxFiles={5}
      placeholder="Choose files"
      description="Up to five PDFs"
    />
  </VStack>
);

/**
 * Rejected, flagged and accepted. The component raises size and type errors
 * itself from `maxSize` / `accept`; the message is what makes them useful.
 */
export const Validation = () => (
  <VStack gap={6} style={{width: 380}}>
    <FileInput
      label="Trading licence"
      mode="input"
      value={null}
      onChange={() => {}}
      accept=".pdf,image/*"
      status={{type: 'error', message: 'That file is 9 MB — the limit is 5 MB'}}
      statusVariant="detached"
    />
    <FileInput
      label="Trading licence"
      mode="input"
      value={shopFront}
      onChange={() => {}}
      accept="image/*"
      status={{type: 'warning', message: 'Too blurry to read the expiry date — try again in daylight'}}
      statusVariant="detached"
    />
    <FileInput
      label="Trading licence"
      mode="input"
      value={licenceFile}
      onChange={() => {}}
      accept=".pdf,image/*"
      status={{type: 'success', message: 'Received — we will review it within three working days'}}
      statusVariant="detached"
    />
  </VStack>
);

/** Uploading, and locked out with the reason attached. */
export const UploadStates = () => (
  <VStack gap={4} style={{width: 380}}>
    <FileInput
      label="Trading licence"
      mode="input"
      value={licenceFile}
      onChange={() => {}}
      isLoading
      description="Sending — this keeps going in the background"
    />
    <FileInput
      label="Trading licence"
      mode="input"
      value={licenceFile}
      onChange={() => {}}
      isDisabled
      disabledMessage="Your licence is under review — you cannot replace it until that finishes"
    />
  </VStack>
);

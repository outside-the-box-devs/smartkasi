import {Toast} from '@astryxdesign/core/Toast';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Stack';

/** Confirms a cash sale went through — short, auto-dismissing. */
export const SaleSaved = () => <Toast body="Sale saved — R 109.99" type="info" />;

/** Reversible stock action — Undo sits in the trailing slot. */
export const StockRestored = () => (
  <Toast
    body="Stock count updated for Sunfoil 2L"
    type="info"
    endContent={<Button variant="ghost" label="Undo" />}
  />
);

/** Sync failures persist until dismissed, since the owner needs to notice them. */
export const SyncFailed = () => (
  <VStack gap={3}>
    <Toast body="3 sales failed to sync — check your connection" type="error" />
    <Toast body="Couldn't upload your licence photo" type="error" endContent={<Button variant="ghost" label="Retry" />} />
  </VStack>
);

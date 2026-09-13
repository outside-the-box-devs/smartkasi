import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

/** A single FAQ entry, open by default since it answers the most common question. */
export const SyncFaq = () => (
  <Collapsible trigger="Why does my till say 'waiting to sync'?" defaultIsOpen>
    <Text type="body" color="secondary">
      Every sale is written to this device first, so the till keeps working when
      the signal drops. It uploads automatically the next time you have a
      connection — nothing is lost in between.
    </Text>
  </Collapsible>
);

/** Wrapped in a Card for visual separation, per the accordion pattern. */
export const LicenceHelp = () => (
  <Card width={340}>
    <Collapsible trigger="How long does licence verification take?">
      <Text type="body" color="secondary">
        Most shops are verified within two working days. You can keep selling
        while it&apos;s under review.
      </Text>
    </Collapsible>
  </Card>
);

/** A section that can't be opened yet — the shop has no orders to show. */
export const DisabledSection = () => (
  <Collapsible trigger="Order history" isDisabled defaultIsOpen={false}>
    <Text type="body">No orders yet.</Text>
  </Collapsible>
);

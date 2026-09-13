import {CollapsibleGroup, Collapsible} from '@astryxdesign/core/Collapsible';
import {Text} from '@astryxdesign/core/Text';

/** FAQ page: only one answer open at a time, flat dividers instead of Cards. */
export const HelpAccordion = () => (
  <CollapsibleGroup type="single" defaultValue="sync" hasDividers>
    <Collapsible value="sync" trigger="Why does my till say 'waiting to sync'?">
      <Text type="body" color="secondary">
        Sales are saved on this device first and upload automatically once
        you&apos;re back online.
      </Text>
    </Collapsible>
    <Collapsible value="licence" trigger="How do I get my licence verified?">
      <Text type="body" color="secondary">
        Submit your trading licence from the Licence tab. Most shops are
        verified within two working days.
      </Text>
    </Collapsible>
    <Collapsible value="orders" trigger="How do order stages work?">
      <Text type="body" color="secondary">
        Orders move from Pending to Accepted once you confirm them, then to
        Ready when they&apos;re packed for collection.
      </Text>
    </Collapsible>
  </CollapsibleGroup>
);

/** Comparing shop tabs side by side — multiple sections open at once. */
export const CompareShopTabs = () => (
  <CollapsibleGroup type="multiple" defaultValue={['stock', 'sell']} hasDividers density="spacious">
    <Collapsible value="stock" trigger="Stock">
      <Text type="body" color="secondary">
        24 products, 4 running low. Maize meal and cooking oil need restocking
        this week.
      </Text>
    </Collapsible>
    <Collapsible value="sell" trigger="Sell">
      <Text type="body" color="secondary">
        Cash-only till. Today&apos;s takings: R 4 820.50 across 38 sales.
      </Text>
    </Collapsible>
    <Collapsible value="flyers" trigger="Flyers">
      <Text type="body" color="secondary">
        No active flyers. Add one to reach customers within two kilometres.
      </Text>
    </Collapsible>
  </CollapsibleGroup>
);

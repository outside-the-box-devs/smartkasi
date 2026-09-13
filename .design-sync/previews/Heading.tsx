import {Heading} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

/** The level hierarchy, top to bottom, on a shop's dashboard page. */
export const LevelHierarchy = () => (
  <VStack gap={2}>
    <Heading level={1}>Your shops</Heading>
    <Heading level={2}>Orlando East</Heading>
    <Heading level={3}>Stock on hand</Heading>
    <Heading level={4}>Items running low</Heading>
  </VStack>
);

/** The display type overrides visual size while keeping the semantic level for outline. */
export const DisplayCallout = () => (
  <VStack gap={1}>
    <Heading level={2} type="display-2">
      R 4 820.50
    </Heading>
    <Heading level={3} color="secondary">
      Takings today
    </Heading>
  </VStack>
);

/** A muted secondary heading for a less prominent section, like a card subtitle. */
export const MutedHeading = () => (
  <Heading level={4} color="secondary">
    Recently added products
  </Heading>
);

/** A long shop name truncates to one line with a tooltip on hover. */
export const TruncatedHeading = () => (
  <VStack gap={0} style={{width: 220}}>
    <Heading level={3} maxLines={1}>
      Mama Ndlovu&apos;s Tuck Shop and General Dealer
    </Heading>
  </VStack>
);

/** A sidebar heading kept visually small but announced at the correct outline depth. */
export const SidebarHeadingLevel = () => (
  <Heading level={2} accessibilityLevel={4} color="secondary">
    Quick actions
  </Heading>
);

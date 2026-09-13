import {Section} from '@astryxdesign/core/Section';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {StatusDot} from '@astryxdesign/core/StatusDot';

/**
 * The three backgrounds. `section` (the default) sits flush on the page
 * surface, so it needs dividers or a neighbouring `muted` block to be seen —
 * that is the point: a section is a page region, not a floating card.
 */
export const Variants = () => (
  <VStack gap={3} width={420}>
    {(['section', 'muted', 'transparent'] as const).map((variant) => (
      <Section key={variant} variant={variant} dividers={['top', 'bottom']}>
        <VStack gap={1}>
          <Text type="label">variant=&quot;{variant}&quot;</Text>
          <Text type="supporting">
            Shop details for Thoko’s Spaza, Orlando East.
          </Text>
        </VStack>
      </Section>
    ))}
  </VStack>
);

/**
 * Settings groups, the canonical use. `dividers` separates same-background
 * regions without wrapping each one in a Card.
 */
export const SettingsGroups = () => (
  <VStack width={420}>
    <Section dividers={['bottom']}>
      <HStack gap={3} hAlign="between" vAlign="center">
        <VStack gap={0.5}>
          <Heading level={5}>Trading licence</Heading>
          <Text type="supporting">Checked 14 August by Soweto municipality</Text>
        </VStack>
        <Badge variant="success" label="Verified" />
      </HStack>
    </Section>
    <Section dividers={['bottom']}>
      <HStack gap={3} hAlign="between" vAlign="center">
        <VStack gap={0.5}>
          <Heading level={5}>Opening hours</Heading>
          <Text type="supporting">06:00 to 20:00, seven days a week</Text>
        </VStack>
        <Button label="Change" size="sm" />
      </HStack>
    </Section>
    <Section>
      <HStack gap={3} hAlign="between" vAlign="center">
        <VStack gap={0.5}>
          <Heading level={5}>Offline sales</Heading>
          <Text type="supporting">Keep selling with no signal, send later</Text>
        </VStack>
        <HStack gap={2} vAlign="center">
          <StatusDot variant="success" label="On" />
          <Text type="supporting">On</Text>
        </HStack>
      </HStack>
    </Section>
  </VStack>
);

/** `muted` calls out one region — here the sales the device has not sent yet. */
export const MutedCallout = () => (
  <VStack gap={3} width={420}>
    <Section variant="muted">
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StatusDot variant="warning" label="Not sent" />
          <Heading level={5}>12 sales waiting to send</Heading>
        </HStack>
        <Text type="supporting">
          They are saved on this phone. SmartKasi sends them the moment you
          have signal again — you do not need to do anything.
        </Text>
        <HStack gap={2}>
          <Button label="Try now" variant="primary" size="sm" />
          <Button label="See the list" size="sm" />
        </HStack>
      </VStack>
    </Section>
    <Section dividers={['top']}>
      <Text type="supporting">
        Everything below is already on the SmartKasi servers.
      </Text>
    </Section>
  </VStack>
);

/** `padding={0}` gives edge-to-edge content — a table or list against the rule. */
export const EdgeToEdge = () => (
  <VStack width={420}>
    <Section paddingBlock={3} paddingInline={4} dividers={['bottom']}>
      <Heading level={4}>Stock on hand</Heading>
    </Section>
    <Section padding={0} dividers={['bottom']}>
      <VStack>
        {[
          ['Maize meal — Iwisa 10 kg', '24'],
          ['Brown bread — Albany 700 g', '11'],
          ['Cooking oil — Sunfoil 2 L', '3'],
        ].map(([product, qty]) => (
          <Section key={product} paddingBlock={2} paddingInline={4}>
            <HStack hAlign="between" vAlign="center">
              <Text>{product}</Text>
              <Text hasTabularNumbers>{qty}</Text>
            </HStack>
          </Section>
        ))}
      </VStack>
    </Section>
  </VStack>
);

/**
 * Section is for page regions; Card is for discrete items. Here the region is
 * the section and each shop inside it is a card.
 */
export const SectionVersusCard = () => (
  <Section variant="muted" width={420}>
    <VStack gap={3}>
      <Heading level={4}>Your shops</Heading>
      {[
        ['Thoko’s Spaza', 'Orlando East', 'Verified'],
        ['Kasi Corner Store', 'Diepkloof', 'Under review'],
      ].map(([name, township, licence]) => (
        <Card key={name} padding={3}>
          <HStack gap={3} hAlign="between" vAlign="center">
            <VStack gap={0.5}>
              <Text weight="semibold">{name}</Text>
              <Text type="supporting">{township}</Text>
            </VStack>
            <Badge
              variant={licence === 'Verified' ? 'success' : 'warning'}
              label={licence}
            />
          </HStack>
        </Card>
      ))}
    </VStack>
  </Section>
);

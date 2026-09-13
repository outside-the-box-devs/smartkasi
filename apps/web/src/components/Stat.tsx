'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { useCountUp } from '@/hooks/use-count-up';

/**
 * A single stat tile: label, count-up value, and an optional hint line.
 * Shared by the dashboard home and the shops list — both used to hand-roll
 * their own near-identical version of this.
 */
export default function Stat({
  label,
  value,
  hint,
  tone,
  index = 0,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: 'warning';
  /** Stagger delay for the entrance animation when several Stats render together. */
  index?: number;
}) {
  const display = useCountUp(value);
  return (
    <Card className="sk-enter" style={{ animationDelay: `${index * 70}ms` }}>
      <VStack gap={1}>
        <Text type="supporting">{label}</Text>
        <Heading level={3}>{display}</Heading>
        {hint && (
          <Text
            type="supporting"
            style={{
              color: tone === 'warning' && value > 0 ? 'var(--color-warning)' : undefined,
            }}
          >
            {hint}
          </Text>
        )}
      </VStack>
    </Card>
  );
}

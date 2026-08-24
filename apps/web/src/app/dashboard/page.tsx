"use client";

import { useRouter } from "next/navigation";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { useShops, useLowStock } from "@/hooks/use-shops";
import { useCountUp } from "@/hooks/use-count-up";

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: shops = [], isLoading } = useShops({ owner_id: "me" });
  const lowStockCount = useLowStock(shops.map((s) => s.id)).data?.length ?? 0;

  const verified = shops.filter((s) => s.licence_status === "verified").length;
  const firstName = user?.email?.split("@")[0];

  return (
    <VStack gap={6}>
      <VStack gap={1} className="sk-enter">
        <Heading level={2}>
          {firstName ? `Welcome, ${firstName}` : "Welcome"}
        </Heading>
        <Text type="body" color="secondary">
          Here&apos;s how your shops are doing today.
        </Text>
      </VStack>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Grid gap={4} columns={{ minWidth: 220, max: 3 }}>
            <Stat
              label="Shops"
              value={shops.length}
              hint={`${verified} licence${verified === 1 ? "" : "s"} verified`}
              index={0}
            />
            <Stat
              label="Taking orders"
              value={shops.filter((s) => s.accepts_orders).length}
              hint="visible to customers now"
              index={1}
            />
            <Stat
              label="Items running low"
              value={lowStockCount}
              hint="need restocking"
              tone={lowStockCount > 0 ? "warning" : undefined}
              index={2}
            />
          </Grid>

          <HStack gap={4} className="sk-enter" style={{ flexWrap: "wrap", alignItems: "stretch" }}>
            <Card style={{ flex: 1, minWidth: 280 }}>
              <VStack gap={3}>
                <Heading level={4}>Quick actions</Heading>
                {shops.length > 0 ? (
                  <>
                    <Button
                      variant="primary"
                      label="Open the till"
                      onClick={() =>
                        router.push(`/dashboard/shops/${shops[0].id}?tab=pos`)
                      }
                    />
                    <Button
                      variant="secondary"
                      label="Check stock levels"
                      onClick={() =>
                        router.push(
                          `/dashboard/shops/${shops[0].id}?tab=inventory`,
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      label="Add your first shop"
                      onClick={() => router.push("/dashboard/shops/new")}
                    />
                    <Text type="body" color="secondary">
                      Takes about a minute: a name, an address, done.
                    </Text>
                  </>
                )}
              </VStack>
            </Card>
            <Card style={{ flex: 2, minWidth: 280 }}>
              <VStack gap={2}>
                <Heading level={4}>Your shops</Heading>
                {shops.length === 0 ? (
                  <>
                    <Text type="body" color="secondary">
                      No shops yet — add your first one to get started.
                    </Text>
                    <Button
                      variant="primary"
                      label="Add a shop"
                      onClick={() => router.push("/dashboard/shops/new")}
                    />
                  </>
                ) : (
                  shops.map((s) => (
                    <HStack
                      key={s.id}
                      gap={2}
                      className="sk-enter"
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="ghost"
                        label={s.name}
                        onClick={() => router.push(`/dashboard/shops/${s.id}`)}
                      />
                      <Badge
                        variant={
                          s.licence_status === "verified"
                            ? "success"
                            : s.licence_status === "pending"
                              ? "warning"
                              : "neutral"
                        }
                        label={
                          s.licence_status === "verified"
                            ? "Verified"
                            : s.licence_status
                        }
                      />
                    </HStack>
                  ))
                )}
              </VStack>
            </Card>
          </HStack>
        </>
      )}
    </VStack>
  );
}

/** Loading placeholder shaped like the real dashboard, not a bare spinner. */
function DashboardSkeleton() {
  return (
    <>
      <Grid gap={4} columns={{ minWidth: 220, max: 3 }}>
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <VStack gap={2}>
              <Skeleton height={12} width={96} index={i * 2} />
              <Skeleton height={28} width={64} index={i * 2 + 1} />
            </VStack>
          </Card>
        ))}
      </Grid>
      <Card>
        <VStack gap={3}>
          <Skeleton height={16} width={140} />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={36} index={i + 1} />
          ))}
        </VStack>
      </Card>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  index,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "warning";
  index: number;
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
              color:
                tone === "warning" && value > 0
                  ? "var(--color-warning)"
                  : undefined,
            }}
          >
            {hint}
          </Text>
        )}
      </VStack>
    </Card>
  );
}

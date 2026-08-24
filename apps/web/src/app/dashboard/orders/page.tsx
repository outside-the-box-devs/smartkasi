"use client";

// Shop order queue — ported from the Flutter shop-owner app's orders screen.
// Pending legs get Accept / Reject; accepted legs get Ready. Polls every 20s.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Selector } from "@astryxdesign/core/Selector";
import { Divider } from "@astryxdesign/core/Divider";
import { useShops } from "@/hooks/use-shops";
import {
  useShopOrders,
  useAcceptLeg,
  useRejectLeg,
  useReadyLeg,
} from "@/hooks/use-orders";
import { useFeedback } from "@/hooks/use-feedback";
import { friendlyOrderStatus } from "@/lib/api/orders";
import type { OrderShopStatus, ShopOrderLeg } from "@/lib/api/orders";
import { rands } from "@/lib/api/inventory";

type StatusFilter = "all" | OrderShopStatus;

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Ready", value: "ready" },
  { label: "All", value: "all" },
];

export default function OrdersPage() {
  const router = useRouter();
  const feedback = useFeedback();
  const { data: shops = [], isLoading: shopsLoading } = useShops({
    owner_id: "me",
  });
  const [shopId, setShopId] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("pending");

  const activeShopId = shopId || shops[0]?.id;
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useShopOrders(activeShopId, status);

  const accept = useAcceptLeg(activeShopId, status);
  const reject = useRejectLeg(activeShopId, status);
  const ready = useReadyLeg(activeShopId, status);

  async function runAction(
    leg: ShopOrderLeg,
    action: () => Promise<void>,
    doneMessage: string,
  ) {
    try {
      await action();
      feedback.success(doneMessage, `${leg.id}-${leg.status}`);
    } catch (e) {
      feedback.error(
        e instanceof Error
          ? e.message
          : "Something went wrong — try again.",
        leg.id,
      );
    }
  }

  return (
    <VStack gap={6}>
      <HStack
        gap={3}
        style={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <VStack gap={1}>
          <Heading level={2}>Incoming orders</Heading>
          <Text type="body" color="secondary">
            Accept legs, reject unavailable items, and mark packed orders ready
            for courier pickup.
          </Text>
        </VStack>
        {!shopsLoading && shops.length > 0 && (
          <HStack gap={2} style={{ alignItems: "center" }}>
            <StatusDot variant="success" isPulsing label="Live" />
            <Text type="supporting">Auto-refreshes every 20 seconds</Text>
          </HStack>
        )}
      </HStack>

      {shops.length === 0 && !shopsLoading ? (
        <Card>
          <VStack gap={3}>
            <Text type="body" color="secondary">
              Orders arrive per shop. Add a shop first to start receiving
              customer orders.
            </Text>
            <Button
              variant="primary"
              label="Go to your shops"
              onClick={() => router.push("/dashboard/shops")}
            />
          </VStack>
        </Card>
      ) : (
        <>
          <HStack gap={3} style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
            {shops.length > 1 && (
              <Selector
                label="Shop"
                value={activeShopId ?? ""}
                onChange={(v) => setShopId(v)}
                options={shops.map((s) => ({ label: s.name, value: s.id }))}
              />
            )}
            <VStack gap={1}>
              <Text type="supporting">Status</Text>
              <HStack gap={2} style={{ flexWrap: "wrap" }}>
                {FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    size="sm"
                    variant={status === f.value ? "primary" : "secondary"}
                    label={f.label}
                    onClick={() => setStatus(f.value)}
                  />
                ))}
              </HStack>
            </VStack>
          </HStack>

          {isError && (
            <Banner
              status="warning"
              title="Can't load orders right now"
              description="Check your connection — this page retries automatically every 20 seconds."
              isDismissable
            />
          )}

          {isLoading ? (
            <VStack gap={4}>
              {[0, 1].map((i) => (
                <Card key={i}>
                  <VStack gap={3}>
                    <HStack gap={3} style={{ justifyContent: "space-between" }}>
                      <Skeleton height={20} width={140} index={i} />
                      <Skeleton height={20} width={90} index={i} />
                    </HStack>
                    <Skeleton height={14} width="60%" index={i + 1} />
                    <Divider />
                    <Skeleton height={14} index={i + 2} />
                    <Skeleton height={14} width="75%" index={i + 3} />
                  </VStack>
                </Card>
              ))}
            </VStack>
          ) : orders.length === 0 ? (
            <Card>
              <VStack gap={1}>
                <Heading level={4}>No orders here</Heading>
                <Text type="body" color="secondary">
                  Customer order legs for this filter will appear here as they
                  come in.
                </Text>
              </VStack>
            </Card>
          ) : (
            <VStack gap={4}>
              {orders.map((leg) => (
                <OrderCard
                  key={leg.id}
                  leg={leg}
                  busy={accept.isPending || reject.isPending || ready.isPending}
                  onAccept={() =>
                    runAction(
                      leg,
                      () => accept.mutateAsync({ orderId: leg.order_id }),
                      `Order ${leg.order_number} accepted`,
                    )
                  }
                  onReject={() =>
                    runAction(
                      leg,
                      () => reject.mutateAsync({ orderId: leg.order_id }),
                      `Order ${leg.order_number} marked out of stock`,
                    )
                  }
                  onReady={() =>
                    runAction(
                      leg,
                      () => ready.mutateAsync({ orderId: leg.order_id }),
                      `Order ${leg.order_number} ready for pickup`,
                    )
                  }
                />
              ))}
            </VStack>
          )}
        </>
      )}
    </VStack>
  );
}

function OrderCard({
  leg,
  busy,
  onAccept,
  onReject,
  onReady,
}: {
  leg: ShopOrderLeg;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
  onReady: () => void;
}) {
  const badgeVariant =
    leg.status === "ready" || leg.status === "collected"
      ? "success"
      : leg.status === "rejected" || leg.status === "cancelled"
        ? "neutral"
        : leg.status === "accepted"
          ? "teal"
          : "warning";

  return (
    <Card className="sk-enter">
      <VStack gap={3}>
        <HStack
          gap={3}
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Heading level={4}>{leg.order_number}</Heading>
          <HStack gap={2}>
            <Badge
              variant="neutral"
              label={
                leg.fulfilment_type === "collection" ? "Collection" : "Delivery"
              }
            />
            <Badge
              variant={badgeVariant}
              label={friendlyOrderStatus(leg.status)}
            />
          </HStack>
        </HStack>

        <Text type="body" color="secondary">
          {leg.customer_first_name
            ? `For ${leg.customer_first_name}`
            : "Customer"}{" "}
          · {rands(leg.subtotal_cents)}
          {leg.placed_at && ` · ${formatPlacedAt(leg.placed_at)}`}
        </Text>

        <Divider />

        <VStack gap={1}>
          {leg.items.map((item) => (
            <HStack
              key={item.id}
              gap={2}
              style={{ justifyContent: "space-between" }}
            >
              <Text type="body">
                {item.qty} × {item.product_name}
              </Text>
              <Text type="supporting">{rands(item.line_total_cents)}</Text>
            </HStack>
          ))}
        </VStack>

        {(leg.status === "pending" || leg.status === "accepted") && (
          <HStack gap={2} style={{ flexWrap: "wrap" }}>
            {leg.status === "pending" && (
              <>
                <Button
                  variant="primary"
                  label="Accept"
                  onClick={onAccept}
                  isDisabled={busy}
                />
                <Button
                  variant="secondary"
                  label="Out of stock"
                  onClick={onReject}
                  isDisabled={busy}
                />
              </>
            )}
            {leg.status === "accepted" && (
              <Button
                variant="primary"
                label="Mark ready"
                onClick={onReady}
                isDisabled={busy}
              />
            )}
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

/** Show placed time in SAST without pulling in a date library. */
function formatPlacedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Johannesburg",
  });
}

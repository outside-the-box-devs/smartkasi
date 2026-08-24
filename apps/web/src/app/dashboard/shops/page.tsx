"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Table, proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Divider } from "@astryxdesign/core/Divider";
import { useAuth } from "@/lib/auth/auth-context";
import { useShops, useLowStock } from "@/hooks/use-shops";
import { friendlyLicence } from "@/lib/api/shops";
import type { ShopSummary } from "@/lib/api/shops";
import ShopMap from "@/components/ShopMap";
import LowStockAlert from "@/components/LowStockAlert";

type ModeFilter = "" | ShopSummary["mode"];
type LicenceFilter = "" | ShopSummary["licence_status"];
/** Table requires rows extending Record<string, unknown>. */
type ShopRow = ShopSummary & Record<string, unknown>;

/** Suspense boundary: useSearchParams must not run during static prerender. */
export default function ShopsPage() {
  return (
    <Suspense fallback={<LoadingRows />}>
      <ShopsPageInner />
    </Suspense>
  );
}

function ShopsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<ModeFilter>("");
  const [licence, setLicence] = useState<LicenceFilter>("");
  const { user } = useAuth();

  // Legacy deep links (?add=1) now route to the dedicated wizard page.
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      router.replace("/dashboard/shops/new");
    }
  }, [searchParams, router]);

  const { data: shops = [], isLoading, isError } = useShops({ owner_id: "me" });

  const filtered = useMemo(() => {
    let list = shops;
    if (mode) list = list.filter((s) => s.mode === mode);
    if (licence) list = list.filter((s) => s.licence_status === licence);
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(qq) ||
          s.township?.toLowerCase().includes(qq) ||
          s.city?.toLowerCase().includes(qq),
      );
    }
    return list;
  }, [shops, mode, licence, q]);

  const shopIds = useMemo(() => shops.map((s) => s.id), [shops]);
  const lowStockCount = useLowStock(shopIds).data?.length ?? 0;

  const columns: TableColumn<ShopRow>[] = [
    {
      key: "name",
      header: "Shop",
      width: proportional(2),
      renderCell: (r) => <Text style={{ fontWeight: 600 }}>{r.name}</Text>,
    },
    {
      key: "township",
      header: "Township",
      width: proportional(1),
      renderCell: (r) => (
        <Text type="body" color="secondary">
          {r.township ?? "—"}
        </Text>
      ),
    },
    {
      key: "licence_status",
      header: "Licence",
      width: pixel(140),
      renderCell: (r) => (
        <Badge
          variant={
            r.licence_status === "verified"
              ? "success"
              : r.licence_status === "pending"
                ? "warning"
                : "neutral"
          }
          label={friendlyLicence(r.licence_status)}
        />
      ),
    },
    {
      key: "accepts_orders",
      header: "Orders",
      width: pixel(110),
      renderCell: (r) => (
        <Text
          type="supporting"
          style={{
            color: r.accepts_orders
              ? "var(--color-success)"
              : "var(--color-text-secondary)",
          }}
        >
          {r.accepts_orders ? "Open" : "Closed"}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      width: pixel(110),
      renderCell: (r) => (
        <Button
          size="sm"
          variant="secondary"
          label="Manage"
          onClick={() => router.push(`/dashboard/shops/${r.id}`)}
        />
      ),
    },
  ];

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
          <Heading level={2}>Your shops</Heading>
          <Text type="body" color="secondary">
            {user
              ? `Signed in as ${user.email}`
              : "Manage licences, stock and daily sales"}
          </Text>
        </VStack>
        <Button
          variant="primary"
          label="Add a shop"
          onClick={() => router.push("/dashboard/shops/new")}
        />
      </HStack>

      <Grid gap={4} columns={{ minWidth: 220, max: 3 }}>
        <StatCard label="Shops" value={shops.length} />
        <StatCard
          label="Licences verified"
          value={shops.filter((s) => s.licence_status === "verified").length}
        />
        <StatCard
          label="Items running low"
          value={lowStockCount}
          tone={lowStockCount > 0 ? "warning" : undefined}
        />
      </Grid>

      <LowStockAlert />

      {isError && (
        <Banner
          status="warning"
          title="Can't reach the server"
          description="Retry in a moment — your data is safe."
          isDismissable
        />
      )}

      <Card>
        <VStack gap={4}>
          <TextInput
            value={q}
            onChange={setQ}
            placeholder="Search by name, township or city"
            label="Search"
            hasClear
          />
          <HStack gap={3} style={{ flexWrap: "wrap" }}>
            <Selector
              label="Type"
              value={mode}
              onChange={(v) => setMode(v as ModeFilter)}
              options={[
                { label: "All types", value: "" },
                { label: "Full store", value: "full" },
                { label: "Inventory only", value: "inventory_only" },
                { label: "Advertising only", value: "advertising_only" },
              ]}
            />
            <Selector
              label="Licence"
              value={licence}
              onChange={(v) => setLicence(v as LicenceFilter)}
              options={[
                { label: "Any status", value: "" },
                { label: "Verified", value: "verified" },
                { label: "Under review", value: "pending" },
                { label: "Not submitted", value: "none" },
              ]}
            />
          </HStack>
        </VStack>
      </Card>

      <Card>
        {isLoading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No shops match"
            body={
              shops.length === 0
                ? "Add your first shop to get started."
                : "Try clearing the search or filters."
            }
          />
        ) : (
          <Table
            data={filtered as ShopRow[]}
            columns={columns}
            idKey="id"
            density="balanced"
            hasHover
            isStriped
          />
        )}
      </Card>

      <Card>
        <VStack gap={3}>
          <Heading level={3}>Shop locations</Heading>
          <ShopMap shops={filtered} />
        </VStack>
      </Card>

      <Divider />

      <Grid gap={4} columns={{ minWidth: 240 }}>
        <InfoCard
          title="Delivery fees"
          body="Customers pay R10 base, plus R5 per extra shop and R1.50 per kilometre."
        />
        <InfoCard
          title="Courier coverage"
          body="On foot and by bicycle, couriers cover about 2 km. Vehicles go further."
        />
        <InfoCard
          title="Customer safety"
          body="Customers only see delivery status — never a courier's live route."
        />
      </Grid>
    </VStack>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning";
}) {
  return (
    <Card>
      <VStack gap={1}>
        <Text type="supporting">{label}</Text>
        <Heading level={3}>{value}</Heading>
      </VStack>
    </Card>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <VStack gap={2}>
        <Heading level={4}>{title}</Heading>
        <Text type="body">{body}</Text>
      </VStack>
    </Card>
  );
}

function LoadingRows() {
  return (
    <VStack gap={3}>
      {[0, 1, 2, 3].map((i) => (
        <HStack key={i} gap={4}>
          <Skeleton height={20} width="32%" index={i} />
          <Skeleton height={20} width="22%" index={i} />
          <Skeleton height={20} width="14%" index={i} />
          <Skeleton height={20} width="12%" index={i} />
        </HStack>
      ))}
    </VStack>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <VStack gap={1}>
      <Heading level={4}>{title}</Heading>
      <Text type="body" color="secondary">
        {body}
      </Text>
    </VStack>
  );
}

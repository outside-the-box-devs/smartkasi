"use client";

// Shop locations on one map — reuses the ShopMap component from the shops page.

import { useRouter } from "next/navigation";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useShops } from "@/hooks/use-shops";
import { friendlyLicence } from "@/lib/api/shops";
import ShopMap from "@/components/ShopMap";

export default function MapPage() {
  const router = useRouter();
  const { data: shops = [], isLoading } = useShops({ owner_id: "me" });

  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={2}>Shop locations</Heading>
        <Text type="body" color="secondary">
          Where your shops sit across the township — teal pins are
          licence-verified.
        </Text>
      </VStack>

      {isLoading ? (
        <Spinner size="md" />
      ) : shops.length === 0 ? (
        <Card>
          <VStack gap={3}>
            <Text type="body" color="secondary">
              No shops to place on the map yet.
            </Text>
            <Button
              variant="primary"
              label="Add a shop"
              onClick={() => router.push("/dashboard/shops/new")}
            />
          </VStack>
        </Card>
      ) : (
        <>
          <Card>
            <ShopMap shops={shops} />
          </Card>

          <Card>
            <VStack gap={2}>
              <Heading level={4}>Pinned shops</Heading>
              {shops.map((s) => (
                <HStack
                  key={s.id}
                  gap={3}
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="ghost"
                    label={s.name}
                    onClick={() => router.push(`/dashboard/shops/${s.id}`)}
                  />
                  <HStack gap={2} style={{ alignItems: "center" }}>
                    <Text type="supporting">{s.township ?? s.city ?? ""}</Text>
                    <Badge
                      variant={
                        s.licence_status === "verified"
                          ? "success"
                          : s.licence_status === "pending"
                            ? "warning"
                            : "neutral"
                      }
                      label={friendlyLicence(s.licence_status)}
                    />
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Card>
        </>
      )}
    </VStack>
  );
}

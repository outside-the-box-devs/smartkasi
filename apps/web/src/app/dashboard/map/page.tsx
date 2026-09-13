"use client";

// Shop locations on one map — reuses the ShopMap component from the shops page.

import { useRouter } from "next/navigation";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Banner } from "@astryxdesign/core/Banner";
import { useShops } from "@/hooks/use-shops";
import { friendlyLicence, licenceDotVariant } from "@/lib/api/shops";
import ShopMap from "@/components/ShopMap";

export default function MapPage() {
  const router = useRouter();
  const { data: shops = [], isLoading, isError } = useShops({ owner_id: "me" });

  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={2}>Shop locations</Heading>
        <Text type="body" color="secondary">
          Where your shops sit across the township — teal pins are
          licence-verified.
        </Text>
      </VStack>

      {isError ? (
        <Banner
          status="error"
          title="Can't load your shops right now"
          description="Check your connection and refresh the page."
        />
      ) : isLoading ? (
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
                    <StatusDot
                      variant={licenceDotVariant(s.licence_status)}
                      label={friendlyLicence(s.licence_status)}
                    />
                    <Text type="supporting">{friendlyLicence(s.licence_status)}</Text>
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

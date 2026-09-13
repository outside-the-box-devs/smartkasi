"use client";

import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@astryxdesign/core/AppShell";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/Stack";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { useThemeMode } from "@/app/providers";

import {
  HomeIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { BuildingStorefrontIcon as StoreSolid } from "@heroicons/react/24/solid";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}

/** A section link is "current" on an exact match, or anywhere under it —
 *  except Dashboard itself, which would otherwise match every route. */
function isCurrent(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, setMode } = useThemeMode();

  return (
    <AppShell
      contentPadding={6}
      sideNav={
        <SideNav
          header={
            <SideNavHeading
              icon={
                <NavIcon
                  icon={<StoreSolid style={{ width: 16, height: 16 }} />}
                />
              }
              heading="SmartKasi"
              headingHref="/dashboard"
            />
          }
          footer={
            <VStack gap={2}>
              {user?.email && <Text type="supporting">{user.email}</Text>}
              <SegmentedControl
                size="sm"
                label="Colour theme"
                value={mode}
                onChange={(v) => setMode(v as typeof mode)}
              >
                <SegmentedControlItem
                  value="light"
                  label="Light"
                  icon={<SunIcon style={{ width: 14, height: 14 }} />}
                />
                <SegmentedControlItem
                  value="dark"
                  label="Dark"
                  icon={<MoonIcon style={{ width: 14, height: 14 }} />}
                />
                <SegmentedControlItem
                  value="system"
                  label="Auto"
                  icon={<ComputerDesktopIcon style={{ width: 14, height: 14 }} />}
                />
              </SegmentedControl>
              <Button
                size="sm"
                variant="ghost"
                label="Sign out"
                onClick={() =>
                  signOut().then(() => router.push("/auth/login"))
                }
              />
            </VStack>
          }
        >
          <SideNavSection title="Operations">
            <SideNavItem
              label="Dashboard"
              icon={HomeIcon}
              href="/dashboard"
              isSelected={isCurrent(pathname, "/dashboard")}
            />
            <SideNavItem
              label="Shops"
              icon={BuildingStorefrontIcon}
              href="/dashboard/shops"
              isSelected={isCurrent(pathname, "/dashboard/shops")}
            />
            <SideNavItem
              label="Map"
              icon={MapIcon}
              href="/dashboard/map"
              isSelected={isCurrent(pathname, "/dashboard/map")}
            />
            <SideNavItem
              label="Orders"
              icon={ShoppingBagIcon}
              href="/dashboard/orders"
              isSelected={isCurrent(pathname, "/dashboard/orders")}
            />
          </SideNavSection>
        </SideNav>
      }
    >
      {children}
    </AppShell>
  );
}

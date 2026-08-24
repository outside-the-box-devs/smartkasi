import { haversineM } from '../../common/geo';
import type {
  CourierMode,
  DeliveryStatus,
  OrderShopStatus,
} from '../../generated/prisma/client';

/**
 * Delivery presentation, and the route-privacy boundary.
 *
 * `presentCustomerDelivery` BUILDS a fresh object field by field. It is never a
 * spread-and-delete of a database row, and that is deliberate: a whitelist
 * cannot leak a column somebody adds later, a blacklist can. Adding a
 * coordinate, a route, or a courier phone number here is the one change in this
 * repo that turns a delivery app into a robbery tool. See
 * docs/API_CONTRACT.md § Route privacy.
 */

/**
 * Legs a courier actually visits. `pending` is excluded because the shop has
 * not agreed to fulfil yet, `rejected`/`cancelled` because there is nothing to
 * collect.
 */
export const PICKUP_LEG_STATUSES: OrderShopStatus[] = [
  'accepted',
  'preparing',
  'ready',
  'collected',
];

/**
 * Rough door-to-door speeds, not vehicle top speeds — these are unpaved
 * shortcuts, gates, and dogs. They exist only to pick one of four ETA bands, so
 * being 30% out changes nothing.
 */
const SPEED_M_PER_MIN: Record<CourierMode, number> = {
  foot: 83, //  ~5 km/h
  bicycle: 200, // ~12 km/h
  vehicle: 417, // ~25 km/h
};

/** Time lost per shop: finding the owner, checking the bag, paying. */
const HANDLING_MIN_PER_PICKUP = 3;

/** Mode reach. The contract caps foot and bicycle at ~2 km; vehicle is uncapped. */
export const MODE_MAX_RADIUS_M: Record<CourierMode, number> = {
  foot: 2000,
  bicycle: 2000,
  vehicle: Number.MAX_SAFE_INTEGER,
};

export interface RouteStop {
  shopId: string;
  shopName: string;
  addressLine: string;
  lat: number;
  lng: number;
  phone: string | null;
  collected: boolean;
  itemCount: number;
}

export interface RouteLeg {
  shopId: string;
  status: OrderShopStatus;
  distanceM: number | null;
  shop: {
    name: string;
    addressLine: string;
    lat: number;
    lng: number;
    phone: string | null;
  };
  items: Array<{ qty: number; fulfilledQty: number | null }>;
}

/**
 * Pickup order: furthest from the customer first, so the run ends next door to
 * the drop-off. `distanceM` was measured from the drop-off at quote time, so it
 * is already the right number — no second distance matrix needed. Shop id
 * breaks ties so two couriers reading the same job see the same sequence.
 */
export function sequencePickups(legs: RouteLeg[]): RouteStop[] {
  return legs
    .filter((leg) => PICKUP_LEG_STATUSES.includes(leg.status))
    .slice()
    .sort(
      (a, b) =>
        (b.distanceM ?? 0) - (a.distanceM ?? 0) ||
        a.shopId.localeCompare(b.shopId),
    )
    .map((leg) => ({
      shopId: leg.shopId,
      shopName: leg.shop.name,
      addressLine: leg.shop.addressLine,
      lat: leg.shop.lat,
      lng: leg.shop.lng,
      phone: leg.shop.phone,
      collected: leg.status === 'collected',
      itemCount: leg.items.reduce(
        (sum, i) => sum + (i.fulfilledQty ?? i.qty),
        0,
      ),
    }));
}

export interface DropoffPoint {
  lat: number | null;
  lng: number | null;
}

/**
 * Metres walked/ridden over the whole run: stop to stop, then to the customer.
 * Straight-line, because there is no routing engine here and a township street
 * graph would not survive one either.
 */
export function routeDistanceM(
  stops: RouteStop[],
  dropoff: DropoffPoint,
): number {
  if (dropoff.lat === null || dropoff.lng === null) return 0;

  const points = [
    ...stops.map((s) => ({ lat: s.lat, lng: s.lng })),
    { lat: dropoff.lat, lng: dropoff.lng },
  ];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineM(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng,
    );
  }
  return total;
}

export type EtaBand = 'under-10min' | '10-20min' | '20-40min' | 'over-40min';

/**
 * Coarse on purpose. A precise ETA is a precise location, and the four bands in
 * the contract are the complete set a customer app may render.
 *
 * Computed from shop and drop-off coordinates only — never from a courier
 * position, which is why no `DeliveryPosition` row is read anywhere in this
 * file.
 */
export function etaBand(
  status: DeliveryStatus,
  mode: CourierMode | null,
  stops: RouteStop[],
  dropoff: DropoffPoint,
): EtaBand | null {
  if (status === 'unassigned' || status === 'delivered' || status === 'failed')
    return null;
  if (!mode) return null;

  const remaining = stops.filter((s) => !s.collected);
  const metres = routeDistanceM(remaining.length ? remaining : [], dropoff);
  const minutes =
    metres / SPEED_M_PER_MIN[mode] + remaining.length * HANDLING_MIN_PER_PICKUP;

  if (minutes < 10) return 'under-10min';
  if (minutes < 20) return '10-20min';
  if (minutes < 40) return '20-40min';
  return 'over-40min';
}

/**
 * "Thabo Mahlangu" -> "Thabo M." — enough for the customer to greet the person
 * at the gate, not enough to look them up afterwards.
 */
export function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Courier';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export interface CustomerDeliveryInput {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  mode: CourierMode | null;
  createdAt: Date;
  assignedAt: Date | null;
  collectedAt: Date | null;
  deliveredAt: Date | null;
  courier: {
    mode: CourierMode;
    ratingAvg: unknown;
    profile: { fullName: string };
  } | null;
}

/**
 * The ONLY delivery shape a customer app may receive.
 *
 * The courier block stays null until `collected`. Before that the customer has
 * no reason to know who is coming, and a name plus a status is enough to work
 * out where somebody is if you also know the shops.
 */
export function presentCustomerDelivery(
  delivery: CustomerDeliveryInput,
  stops: RouteStop[],
  dropoff: DropoffPoint,
) {
  const revealCourier =
    delivery.courier !== null &&
    (
      ['collected', 'en_route_dropoff', 'delivered'] as DeliveryStatus[]
    ).includes(delivery.status);

  return {
    id: delivery.id,
    order_id: delivery.orderId,
    status: delivery.status,
    mode: delivery.mode,
    eta_band: etaBand(delivery.status, delivery.mode, stops, dropoff),
    courier: revealCourier
      ? {
          display_name: displayName(delivery.courier!.profile.fullName),
          mode: delivery.courier!.mode,
          rating_avg:
            delivery.courier!.ratingAvg === null
              ? null
              : Number(delivery.courier!.ratingAvg),
        }
      : null,
    updated_at: (
      delivery.deliveredAt ??
      delivery.collectedAt ??
      delivery.assignedAt ??
      delivery.createdAt
    ).toISOString(),
  };
}

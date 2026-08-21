/**
 * Distance maths.
 *
 * There is no PostGIS in this schema — Prisma cannot read a `geography`
 * column at all, so coordinates are plain doubles and distance is computed
 * here. See the header of db/schema.sql for the full tradeoff.
 *
 * The pattern everywhere is: cheap bounding-box filter in the database (which
 * DOES use the (lat, lng) index), then exact haversine in Node on the small
 * result set. A bounding box over-selects the corners of the square, which is
 * why the haversine pass afterwards is not optional.
 */

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a)));
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Square that fully contains the circle of `radiusM` around the point.
 * Longitude degrees shrink with latitude, hence the cos() term — at Soweto's
 * -26.2 that is about a 10% difference, which matters at a 2 km radius.
 */
export function boundingBox(lat: number, lng: number, radiusM: number): BoundingBox {
  const latDelta = (radiusM / EARTH_RADIUS_M) * (180 / Math.PI);
  const cos = Math.max(Math.cos(toRad(lat)), 1e-6);
  const lngDelta = latDelta / cos;
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/** Prisma `where` fragment for the bounding box. */
export function boxWhere(lat: number, lng: number, radiusM: number) {
  const box = boundingBox(lat, lng, radiusM);
  return {
    lat: { gte: box.minLat, lte: box.maxLat },
    lng: { gte: box.minLng, lte: box.maxLng },
  };
}

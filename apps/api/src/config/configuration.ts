export default () => ({
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'v1',
  databaseUrl: process.env.DATABASE_URL ?? '',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.R2_BUCKET ?? 'smartkasi',
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? '',
  },
  // Decided 2026-08-24, see docs/API_CONTRACT.md § 9 and issue #34. These are
  // no longer placeholders; changing one is a commercial decision, not a tweak.
  //
  //   service_fee = base + per_extra_shop x (shops - 1) + per_km x ceil(km)
  //
  // One shop, 1 km:  R21.50 -> courier R16.13, platform R5.37
  // Two shops, 2 km: R31.00 -> courier R23.25, platform R7.75
  //
  // The previous R10/R5/R1.50 at an 80% share paid a courier R9.20 for a
  // half-hour round trip on foot. That is below minimum wage for a job that
  // involves carrying cash, which is a large part of why courier supply does
  // not exist as a pool.
  fees: {
    baseCents: Number(process.env.FEE_BASE_CENTS ?? 1800),
    perExtraShopCents: Number(process.env.FEE_PER_EXTRA_SHOP_CENTS ?? 600),
    perKmCents: Number(process.env.FEE_PER_KM_CENTS ?? 350),
    // A foot courier's default max_radius_m is 2000. They cover the shop-to-shop
    // spread PLUS the leg to the customer, so a 2000 m spread can build a route
    // the assigned courier cannot reasonably walk. 1500 keeps it inside.
    maxBasketSpreadM: Number(process.env.MAX_BASKET_SPREAD_M ?? 1500),
    // Share of the service fee that reaches the courier; the remainder is the
    // platform cut, fixed at the moment delivery is requested.
    courierSharePct: Number(process.env.FEE_COURIER_SHARE_PCT ?? 75),
  },
});

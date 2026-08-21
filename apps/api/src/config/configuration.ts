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
  fees: {
    baseCents: Number(process.env.FEE_BASE_CENTS ?? 1000),
    perExtraShopCents: Number(process.env.FEE_PER_EXTRA_SHOP_CENTS ?? 500),
    perKmCents: Number(process.env.FEE_PER_KM_CENTS ?? 150),
    maxBasketSpreadM: Number(process.env.MAX_BASKET_SPREAD_M ?? 2000),
  },
});

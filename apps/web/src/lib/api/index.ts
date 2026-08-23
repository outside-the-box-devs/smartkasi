// SmartKasi API — domain modules.
// Import from here: `import { shopsApi, inventoryApi } from '@/lib/api'`
export { ApiError, API_BASE } from './client';
export { shopsApi, friendlyLicence } from './shops';
export type { ShopSummary, ShopDetail, ShopMode, LicenceStatus } from './shops';
export { inventoryApi, rands } from './inventory';
export type { InventoryItem } from './inventory';
export { catalogApi } from './catalog';
export type { ScannedProduct } from './catalog';
export { salesApi } from './sales';
export type { SalePayload, SaleLine } from './sales';
export { ordersApi, friendlyOrderStatus } from './orders';
export type { ShopOrderLeg, OrderItem, OrderShopStatus } from './orders';
export { flyersApi } from './flyers';
export type { Flyer } from './flyers';
export { presignUpload, uploadFile } from './uploads';

// Offline-first POS storage — free OSS: idb (https://github.com/jakearchibald/idb)
// No reinventing wheel: idb wraps IndexedDB with promises, handles offline queue & sync pull.
import { openDB, DBSchema } from 'idb';

interface OfflineDB extends DBSchema {
  inventory: { key: string; value: { shopProductId: string; shopId: string; productId: string; price_cents: number; stock_qty: number; updated_at: string } };
  salesQueue: { key: string; value: { client_sale_id: string; shopId: string; payload: unknown; createdAt: string } };
  products: { key: string; value: { barcode: string; productId: string; name: string } };
}

const dbPromise = typeof window !== 'undefined'
  ? openDB<OfflineDB>('smartkasi-pos', 1, {
      upgrade(db) {
        db.createObjectStore('inventory', { keyPath: 'shopProductId' });
        db.createObjectStore('salesQueue', { keyPath: 'client_sale_id' });
        db.createObjectStore('products', { keyPath: 'barcode' });
      },
    })
  : (null as unknown as Promise<any>);

export const offlineDB = {
  async putInventory(item: OfflineDB['inventory']['value']) {
    const db = await dbPromise;
    return db.put('inventory', item);
  },
  async getInventory(shopProductId: string) {
    const db = await dbPromise;
    return db.get('inventory', shopProductId);
  },
  async queueSale(sale: OfflineDB['salesQueue']['value']) {
    const db = await dbPromise;
    return db.put('salesQueue', sale);
  },
  async getQueuedSales() {
    const db = await dbPromise;
    return db.getAll('salesQueue');
  },
  async clearQueuedSale(id: string) {
    const db = await dbPromise;
    return db.delete('salesQueue', id);
  },
};

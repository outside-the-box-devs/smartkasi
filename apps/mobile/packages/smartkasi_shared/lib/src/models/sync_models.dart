part of '../models.dart';

/// One response from `GET /shops/{shopId}/sync`.
///
/// [inventoryJson] is carried alongside the parsed [inventory] on purpose. The
/// local catalogue persists the server's own JSON rather than re-serialising a
/// model, so a field this app does not read yet still survives the round trip
/// through storage — and there is no second place to update when the contract
/// grows an optional field.
class SyncDelta {
  const SyncDelta({
    required this.serverTime,
    required this.isFullSnapshot,
    required this.inventory,
    required this.inventoryJson,
    required this.deletedShopProductIds,
    this.shop,
  });

  factory SyncDelta.fromJson(JsonMap json) {
    final rows = asMapList(json['inventory']);
    return SyncDelta(
      // The cursor for the next pull. Always the server's clock — a till with a
      // wrong date that sent its own would silently skip updates for ever.
      serverTime: text(json['server_time']),
      isFullSnapshot: flag(json['is_full_snapshot']),
      shop: json['shop'] == null ? null : Shop.fromJson(asMap(json['shop'])),
      inventory: rows.map(InventoryItem.fromJson).toList(),
      inventoryJson: rows,
      deletedShopProductIds: asStringList(json['deleted_shop_product_ids']),
    );
  }

  final String serverTime;
  final bool isFullSnapshot;
  final Shop? shop;
  final List<InventoryItem> inventory;
  final List<JsonMap> inventoryJson;

  /// Tombstones. Items the owner removed while this till was offline.
  final List<String> deletedShopProductIds;

  bool get isEmpty => inventory.isEmpty && deletedShopProductIds.isEmpty;
}

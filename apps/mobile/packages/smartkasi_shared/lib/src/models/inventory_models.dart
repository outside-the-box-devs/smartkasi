part of '../models.dart';

class InventoryItem {
  const InventoryItem({
    required this.id,
    required this.priceCents,
    required this.stockQty,
    required this.lowStockThreshold,
    required this.isAvailable,
    required this.isLowStock,
    required this.product,
    this.costCents,
    this.updatedAt,
  });

  factory InventoryItem.fromJson(JsonMap json) => InventoryItem(
    id: text(json['id']),
    priceCents: cents(json['price_cents']),
    costCents: json['cost_cents'] == null ? null : cents(json['cost_cents']),
    stockQty: cents(json['stock_qty']),
    lowStockThreshold: cents(json['low_stock_threshold']),
    isAvailable: flag(json['is_available']),
    isLowStock: flag(json['is_low_stock']),
    product: Product.fromJson(asMap(json['product'])),
    updatedAt: optionalText(json['updated_at']),
  );

  final String id;
  final int priceCents;
  final int? costCents;
  final int stockQty;
  final int lowStockThreshold;
  final bool isAvailable;
  final bool isLowStock;
  final Product product;
  final String? updatedAt;
}

class InventoryItemCore {
  const InventoryItemCore({
    required this.id,
    required this.priceCents,
    required this.stockQty,
    required this.lowStockThreshold,
    required this.isAvailable,
  });

  factory InventoryItemCore.fromJson(JsonMap json) => InventoryItemCore(
    id: text(json['id']),
    priceCents: cents(json['price_cents']),
    stockQty: cents(json['stock_qty']),
    lowStockThreshold: cents(json['low_stock_threshold']),
    isAvailable: flag(json['is_available']),
  );

  final String id;
  final int priceCents;
  final int stockQty;
  final int lowStockThreshold;
  final bool isAvailable;
}

class BarcodeLookupResult {
  const BarcodeLookupResult({required this.product, this.shopProduct});

  factory BarcodeLookupResult.fromJson(JsonMap json) => BarcodeLookupResult(
    product: Product.fromJson(asMap(json['product'])),
    shopProduct: json['shop_product'] == null
        ? null
        : InventoryItemCore.fromJson(asMap(json['shop_product'])),
  );

  final Product product;
  final InventoryItemCore? shopProduct;
}

class CartLine {
  const CartLine({
    required this.product,
    required this.offer,
    required this.qty,
  });

  final Product product;
  final ProductOffer offer;
  final int qty;

  String get key => '${offer.shopId}:${product.id}';
  int get lineTotalCents => offer.priceCents * qty;

  CartLine copyWith({int? qty}) =>
      CartLine(product: product, offer: offer, qty: qty ?? this.qty);
}

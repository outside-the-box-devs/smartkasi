part of '../models.dart';

class ApiException implements Exception {
  const ApiException({
    required this.code,
    required this.message,
    this.statusCode,
    this.requestId,
    this.details = const [],
  });

  final String code;
  final String message;
  final int? statusCode;
  final String? requestId;
  final List<Object?> details;

  @override
  String toString() => '$code: $message';
}

class Page<T> {
  const Page({
    required this.data,
    required this.page,
    required this.perPage,
    required this.total,
    required this.totalPages,
  });

  factory Page.fromJson(JsonMap json, T Function(JsonMap) parse) {
    final meta = asMap(json['meta']);
    return Page<T>(
      data: asMapList(json['data']).map(parse).toList(),
      page: cents(meta['page']),
      perPage: cents(meta['per_page']),
      total: cents(meta['total']),
      totalPages: cents(meta['total_pages']),
    );
  }

  final List<T> data;
  final int page;
  final int perPage;
  final int total;
  final int totalPages;
}

class Profile {
  const Profile({
    required this.id,
    required this.role,
    required this.fullName,
    required this.shopIds,
    this.phone,
    this.avatarUrl,
    this.homeAddress,
    this.homeLat,
    this.homeLng,
  });

  factory Profile.fromJson(JsonMap json) => Profile(
    id: text(json['id']),
    role: text(json['role']),
    fullName: text(json['full_name'], 'SmartKasi user'),
    phone: optionalText(json['phone']),
    avatarUrl: optionalText(json['avatar_url']),
    homeAddress: optionalText(json['home_address']),
    homeLat: json['home_lat'] == null ? null : decimal(json['home_lat']),
    homeLng: json['home_lng'] == null ? null : decimal(json['home_lng']),
    shopIds: json['shop_ids'] is List
        ? (json['shop_ids'] as List).map((e) => e.toString()).toList()
        : const [],
  );

  final String id;
  final String role;
  final String fullName;
  final String? phone;
  final String? avatarUrl;
  final String? homeAddress;
  final double? homeLat;
  final double? homeLng;
  final List<String> shopIds;

  String get firstName => fullName.split(' ').first;
}

class Shop {
  const Shop({
    required this.id,
    required this.name,
    required this.slug,
    required this.addressLine,
    required this.lat,
    required this.lng,
    required this.mode,
    required this.acceptsOrders,
    required this.acceptsDelivery,
    required this.isOpenNow,
    this.logoUrl,
    this.township,
    this.city,
    this.distanceM,
    this.licenceStatus,
    this.phone,
    this.productCount,
  });

  factory Shop.fromJson(JsonMap json) => Shop(
    id: text(json['id']),
    name: text(json['name']),
    slug: text(json['slug']),
    logoUrl: optionalText(json['logo_url']),
    addressLine: text(json['address_line']),
    township: optionalText(json['township']),
    city: optionalText(json['city']),
    lat: decimal(json['lat']),
    lng: decimal(json['lng']),
    distanceM: json['distance_m'] == null ? null : cents(json['distance_m']),
    mode: text(json['mode']),
    acceptsOrders: flag(json['accepts_orders']),
    acceptsDelivery: flag(json['accepts_delivery']),
    isOpenNow: flag(json['is_open_now']),
    licenceStatus: optionalText(json['licence_status']),
    phone: optionalText(json['phone']),
    productCount: json['product_count'] == null
        ? null
        : cents(json['product_count']),
  );

  final String id;
  final String name;
  final String slug;
  final String? logoUrl;
  final String addressLine;
  final String? township;
  final String? city;
  final double lat;
  final double lng;
  final int? distanceM;
  final String mode;
  final bool acceptsOrders;
  final bool acceptsDelivery;
  final bool isOpenNow;
  final String? licenceStatus;
  final String? phone;
  final int? productCount;
}

class Category {
  const Category({required this.id, required this.name});

  factory Category.fromJson(JsonMap json) =>
      Category(id: text(json['id']), name: text(json['name']));

  final String id;
  final String name;
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.isVerified,
    this.barcode,
    this.brand,
    this.unitSize,
    this.imageUrl,
    this.category,
  });

  factory Product.fromJson(JsonMap json) => Product(
    id: text(json['id']),
    barcode: optionalText(json['barcode']),
    name: text(json['name']),
    brand: optionalText(json['brand']),
    unitSize: optionalText(json['unit_size']),
    imageUrl: optionalText(json['image_url']),
    category: json['category'] == null
        ? null
        : Category.fromJson(asMap(json['category'])),
    isVerified: flag(json['is_verified']),
  );

  final String id;
  final String? barcode;
  final String name;
  final String? brand;
  final String? unitSize;
  final String? imageUrl;
  final Category? category;
  final bool isVerified;

  String get displayUnit => [
    if (brand != null && brand!.isNotEmpty) brand,
    if (unitSize != null && unitSize!.isNotEmpty) unitSize,
  ].join(' - ');
}

class PriceStats {
  const PriceStats({
    required this.offerCount,
    required this.avgPriceCents,
    required this.minPriceCents,
    required this.maxPriceCents,
  });

  factory PriceStats.fromJson(JsonMap json) => PriceStats(
    offerCount: cents(json['offer_count']),
    avgPriceCents: cents(json['avg_price_cents']),
    minPriceCents: cents(json['min_price_cents']),
    maxPriceCents: cents(json['max_price_cents']),
  );

  final int offerCount;
  final int avgPriceCents;
  final int minPriceCents;
  final int maxPriceCents;
}

class ProductOffer {
  const ProductOffer({
    required this.shopId,
    required this.shopName,
    required this.priceCents,
    required this.stockQty,
    required this.acceptsOrders,
    this.distanceM,
  });

  factory ProductOffer.fromJson(JsonMap json) => ProductOffer(
    shopId: text(json['shop_id']),
    shopName: text(json['shop_name']),
    distanceM: json['distance_m'] == null ? null : cents(json['distance_m']),
    priceCents: cents(json['price_cents']),
    stockQty: cents(json['stock_qty']),
    acceptsOrders: flag(json['accepts_orders']),
  );

  final String shopId;
  final String shopName;
  final int? distanceM;
  final int priceCents;
  final int stockQty;
  final bool acceptsOrders;
}

class ProductSearchResult {
  const ProductSearchResult({
    required this.product,
    required this.priceStats,
    required this.offers,
  });

  factory ProductSearchResult.fromJson(JsonMap json) => ProductSearchResult(
    product: Product.fromJson(asMap(json['product'])),
    priceStats: PriceStats.fromJson(asMap(json['price_stats'])),
    offers: asMapList(json['offers']).map(ProductOffer.fromJson).toList(),
  );

  final Product product;
  final PriceStats priceStats;
  final List<ProductOffer> offers;
}

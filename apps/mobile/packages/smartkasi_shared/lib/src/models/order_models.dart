part of '../models.dart';

class FeeLine {
  const FeeLine({required this.label, required this.amountCents});

  factory FeeLine.fromJson(JsonMap json) => FeeLine(
    label: text(json['label']),
    amountCents: cents(json['amount_cents']),
  );

  final String label;
  final int amountCents;
}

class QuoteLeg {
  const QuoteLeg({
    required this.shopId,
    required this.shopName,
    required this.distanceM,
    required this.subtotalCents,
    required this.allItemsAvailable,
  });

  factory QuoteLeg.fromJson(JsonMap json) => QuoteLeg(
    shopId: text(json['shop_id']),
    shopName: text(json['shop_name']),
    distanceM: cents(json['distance_m']),
    subtotalCents: cents(json['subtotal_cents']),
    allItemsAvailable: flag(json['all_items_available'], true),
  );

  final String shopId;
  final String shopName;
  final int distanceM;
  final int subtotalCents;
  final bool allItemsAvailable;
}

class Quote {
  const Quote({
    required this.quoteId,
    required this.expiresAt,
    required this.fulfilmentType,
    required this.subtotalCents,
    required this.serviceFeeCents,
    required this.deliveryFeeCents,
    required this.totalCents,
    required this.shopCount,
    required this.maxDistanceM,
    required this.feeBreakdown,
    required this.legs,
  });

  factory Quote.fromJson(JsonMap json) => Quote(
    quoteId: text(json['quote_id']),
    expiresAt: text(json['expires_at']),
    fulfilmentType: text(json['fulfilment_type']),
    subtotalCents: cents(json['subtotal_cents']),
    serviceFeeCents: cents(json['service_fee_cents']),
    deliveryFeeCents: cents(json['delivery_fee_cents']),
    totalCents: cents(json['total_cents']),
    shopCount: cents(json['shop_count']),
    maxDistanceM: cents(json['max_distance_m']),
    feeBreakdown: asMapList(
      json['fee_breakdown'],
    ).map(FeeLine.fromJson).toList(),
    legs: asMapList(json['legs']).map(QuoteLeg.fromJson).toList(),
  );

  final String quoteId;
  final String expiresAt;
  final String fulfilmentType;
  final int subtotalCents;
  final int serviceFeeCents;
  final int deliveryFeeCents;
  final int totalCents;
  final int shopCount;
  final int maxDistanceM;
  final List<FeeLine> feeBreakdown;
  final List<QuoteLeg> legs;
}

class OrderItem {
  const OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.qty,
    required this.unitPriceCents,
    required this.lineTotalCents,
    this.fulfilledQty,
  });

  factory OrderItem.fromJson(JsonMap json) => OrderItem(
    id: text(json['id']),
    productId: text(json['product_id']),
    productName: text(json['product_name']),
    qty: cents(json['qty']),
    fulfilledQty: json['fulfilled_qty'] == null
        ? null
        : cents(json['fulfilled_qty']),
    unitPriceCents: cents(json['unit_price_cents']),
    lineTotalCents: cents(json['line_total_cents']),
  );

  final String id;
  final String productId;
  final String productName;
  final int qty;
  final int? fulfilledQty;
  final int unitPriceCents;
  final int lineTotalCents;
}

class OrderLeg {
  const OrderLeg({
    required this.id,
    required this.shopId,
    required this.shopName,
    required this.status,
    required this.subtotalCents,
    required this.items,
    this.distanceM,
    this.shopPhone,
    this.rejectedReason,
  });

  factory OrderLeg.fromJson(JsonMap json) => OrderLeg(
    id: text(json['id']),
    shopId: text(json['shop_id']),
    shopName: text(json['shop_name']),
    shopPhone: optionalText(json['shop_phone']),
    status: text(json['status']),
    distanceM: json['distance_m'] == null ? null : cents(json['distance_m']),
    subtotalCents: cents(json['subtotal_cents']),
    rejectedReason: optionalText(json['rejected_reason']),
    items: asMapList(json['items']).map(OrderItem.fromJson).toList(),
  );

  final String id;
  final String shopId;
  final String shopName;
  final String? shopPhone;
  final String status;
  final int? distanceM;
  final int subtotalCents;
  final String? rejectedReason;
  final List<OrderItem> items;
}

class Order {
  const Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.fulfilmentType,
    required this.totalCents,
    required this.legs,
    required this.placedAt,
    this.dropoffAddress,
    this.subtotalCents = 0,
    this.serviceFeeCents = 0,
    this.deliveryFeeCents = 0,
    this.delivery,
  });

  factory Order.fromJson(JsonMap json) => Order(
    id: text(json['id']),
    orderNumber: text(json['order_number']),
    status: text(json['status']),
    fulfilmentType: text(json['fulfilment_type']),
    dropoffAddress: optionalText(json['dropoff_address']),
    subtotalCents: cents(json['subtotal_cents']),
    serviceFeeCents: cents(json['service_fee_cents']),
    deliveryFeeCents: cents(json['delivery_fee_cents']),
    totalCents: cents(json['total_cents']),
    legs: asMapList(json['legs']).map(OrderLeg.fromJson).toList(),
    delivery: json['delivery'] == null
        ? null
        : CustomerDelivery.fromJson(asMap(json['delivery'])),
    placedAt: text(json['placed_at']),
  );

  final String id;
  final String orderNumber;
  final String status;
  final String fulfilmentType;
  final String? dropoffAddress;
  final int subtotalCents;
  final int serviceFeeCents;
  final int deliveryFeeCents;
  final int totalCents;
  final List<OrderLeg> legs;
  final CustomerDelivery? delivery;
  final String placedAt;
}

class ShopOrderLeg {
  const ShopOrderLeg({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.status,
    required this.fulfilmentType,
    required this.customerFirstName,
    required this.subtotalCents,
    required this.items,
    required this.placedAt,
  });

  factory ShopOrderLeg.fromJson(JsonMap json) => ShopOrderLeg(
    id: text(json['id']),
    orderId: text(json['order_id']),
    orderNumber: text(json['order_number']),
    status: text(json['status']),
    fulfilmentType: text(json['fulfilment_type']),
    customerFirstName: text(json['customer_first_name'], 'Customer'),
    subtotalCents: cents(json['subtotal_cents']),
    items: asMapList(json['items']).map(OrderItem.fromJson).toList(),
    placedAt: text(json['placed_at']),
  );

  final String id;
  final String orderId;
  final String orderNumber;
  final String status;
  final String fulfilmentType;
  final String customerFirstName;
  final int subtotalCents;
  final List<OrderItem> items;
  final String placedAt;
}

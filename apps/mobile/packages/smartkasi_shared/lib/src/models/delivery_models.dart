part of '../models.dart';

class CustomerDelivery {
  const CustomerDelivery({
    required this.id,
    required this.orderId,
    required this.status,
    this.mode,
    this.etaBand,
    this.courierName,
    this.courierRating,
    this.updatedAt,
  });

  factory CustomerDelivery.fromJson(JsonMap json) {
    final courier = asMap(json['courier']);
    return CustomerDelivery(
      id: text(json['id']),
      orderId: text(json['order_id']),
      status: text(json['status']),
      mode: optionalText(json['mode']),
      etaBand: optionalText(json['eta_band']),
      courierName: optionalText(courier['display_name']),
      courierRating: courier['rating_avg'] == null
          ? null
          : decimal(courier['rating_avg']),
      updatedAt: optionalText(json['updated_at']),
    );
  }

  final String id;
  final String orderId;
  final String status;
  final String? mode;
  final String? etaBand;
  final String? courierName;
  final double? courierRating;
  final String? updatedAt;
}

class CourierJob {
  const CourierJob({
    required this.deliveryId,
    required this.orderNumber,
    required this.pickupCount,
    required this.totalDistanceM,
    required this.payoutCents,
    required this.mode,
    required this.expiresAt,
  });

  factory CourierJob.fromJson(JsonMap json) => CourierJob(
    deliveryId: text(json['delivery_id']),
    orderNumber: text(json['order_number']),
    pickupCount: cents(json['pickup_count']),
    totalDistanceM: cents(json['total_distance_m']),
    payoutCents: cents(json['payout_cents']),
    mode: text(json['mode']),
    expiresAt: text(json['expires_at']),
  );

  final String deliveryId;
  final String orderNumber;
  final int pickupCount;
  final int totalDistanceM;
  final int payoutCents;
  final String mode;
  final String expiresAt;
}

class CourierPickup {
  const CourierPickup({
    required this.sequence,
    required this.shopName,
    required this.addressLine,
    required this.collected,
    required this.itemCount,
    this.phone,
  });

  factory CourierPickup.fromJson(JsonMap json) => CourierPickup(
    sequence: cents(json['sequence']),
    shopName: text(json['shop_name']),
    addressLine: text(json['address_line']),
    collected: flag(json['collected']),
    itemCount: cents(json['item_count']),
    phone: optionalText(json['phone']),
  );

  final int sequence;
  final String shopName;
  final String addressLine;
  final bool collected;
  final int itemCount;
  final String? phone;
}

class CourierDelivery {
  const CourierDelivery({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.mode,
    required this.payoutCents,
    required this.cashToCollectCents,
    required this.pickups,
    required this.dropoffAddress,
    this.dropoffNotes,
    this.customerFirstName,
    this.customerPhone,
  });

  factory CourierDelivery.fromJson(JsonMap json) {
    final dropoff = asMap(json['dropoff']);
    return CourierDelivery(
      id: text(json['id']),
      orderNumber: text(json['order_number']),
      status: text(json['status']),
      mode: text(json['mode']),
      payoutCents: cents(json['payout_cents']),
      cashToCollectCents: cents(json['cash_to_collect_cents']),
      pickups: asMapList(json['pickups']).map(CourierPickup.fromJson).toList(),
      dropoffAddress: text(dropoff['address_line']),
      dropoffNotes: optionalText(dropoff['notes']),
      customerFirstName: optionalText(dropoff['customer_first_name']),
      customerPhone: optionalText(dropoff['customer_phone']),
    );
  }

  final String id;
  final String orderNumber;
  final String status;
  final String mode;
  final int payoutCents;
  final int cashToCollectCents;
  final List<CourierPickup> pickups;
  final String dropoffAddress;
  final String? dropoffNotes;
  final String? customerFirstName;
  final String? customerPhone;
}

class DailyReport {
  const DailyReport({
    required this.date,
    required this.saleCount,
    required this.grossCents,
    required this.discountCents,
    required this.netCents,
    required this.voidedCount,
    required this.topProducts,
  });

  factory DailyReport.fromJson(JsonMap json) => DailyReport(
    date: text(json['date']),
    saleCount: cents(json['sale_count']),
    grossCents: cents(json['gross_cents']),
    discountCents: cents(json['discount_cents']),
    netCents: cents(json['net_cents']),
    voidedCount: cents(json['voided_count']),
    topProducts: asMapList(
      json['top_products'],
    ).map(TopProduct.fromJson).toList(),
  );

  final String date;
  final int saleCount;
  final int grossCents;
  final int discountCents;
  final int netCents;
  final int voidedCount;
  final List<TopProduct> topProducts;
}

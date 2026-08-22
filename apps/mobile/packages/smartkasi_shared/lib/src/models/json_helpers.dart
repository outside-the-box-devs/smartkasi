part of '../models.dart';

typedef JsonMap = Map<String, dynamic>;

JsonMap asMap(Object? value) =>
    value is Map<String, dynamic> ? value : <String, dynamic>{};

List<JsonMap> asMapList(Object? value) {
  if (value is List) {
    return value
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }
  return const [];
}

String text(Object? value, [String fallback = '']) =>
    value == null ? fallback : value.toString();

String? optionalText(Object? value) => value?.toString();

int cents(Object? value) {
  if (value is int) return value;
  if (value is num) return value.round();
  return int.tryParse(value.toString()) ?? 0;
}

double decimal(Object? value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

bool flag(Object? value, [bool fallback = false]) {
  if (value is bool) return value;
  if (value is String) return value == 'true';
  return fallback;
}

String encodeJson(Object value) => jsonEncode(value);

String zar(int cents) => 'R${(cents / 100).toStringAsFixed(2)}';

String distanceLabel(int? meters) {
  if (meters == null) return 'nearby';
  if (meters < 1000) return '${meters}m';
  return '${(meters / 1000).toStringAsFixed(1)}km';
}

import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import 'api.dart';
import 'config.dart';
import 'models.dart';

class ThemeController extends ChangeNotifier {
  ThemeController(this._prefs)
    : mode = ThemeMode.values.byName(
        _prefs.getString(_key) ?? ThemeMode.system.name,
      );

  static const _key = 'smartkasi.themeMode';

  final SharedPreferences _prefs;
  ThemeMode mode;

  Future<void> setMode(ThemeMode next) async {
    mode = next;
    await _prefs.setString(_key, next.name);
    notifyListeners();
  }

  Future<void> toggle() =>
      setMode(mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
}

class AuthController extends ChangeNotifier {
  AuthController({required SmartKasiConfig config}) : _config = config;

  final SmartKasiConfig _config;
  SmartKasiApi? _api;
  Profile? profile;
  String? lastError;
  bool isBusy = false;
  bool didRestore = false;

  bool get isSignedIn => profile != null;
  bool get canAuthenticate => _config.hasSupabase;

  void attachApi(SmartKasiApi api) {
    _api = api;
  }

  Future<String?> accessToken() async {
    if (!_config.hasSupabase) return null;
    return Supabase.instance.client.auth.currentSession?.accessToken;
  }

  Future<void> refreshToken() async {
    if (!_config.hasSupabase) return;
    await Supabase.instance.client.auth.refreshSession();
  }

  Future<void> restore() async {
    if (didRestore) return;
    didRestore = true;
    if (!_config.hasSupabase ||
        Supabase.instance.client.auth.currentSession == null) {
      notifyListeners();
      return;
    }
    await _withBusy(() async {
      profile = await _api!.getMe();
    });
  }

  Future<void> signIn(String email, String password) async {
    if (!_config.hasSupabase) {
      throw const ApiException(
        code: 'SUPABASE_CONFIG_MISSING',
        message:
            'Start Flutter with --dart-define=SUPABASE_PUBLISHABLE_KEY=...',
      );
    }

    await _withBusy(() async {
      await Supabase.instance.client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      profile = await _api!.getMe();
    });
  }

  Future<void> signOut() async {
    if (_config.hasSupabase) await Supabase.instance.client.auth.signOut();
    profile = null;
    notifyListeners();
  }

  Future<void> _withBusy(Future<void> Function() action) async {
    isBusy = true;
    lastError = null;
    notifyListeners();
    try {
      await action();
    } catch (error) {
      lastError = error is ApiException ? error.message : error.toString();
      rethrow;
    } finally {
      isBusy = false;
      notifyListeners();
    }
  }
}

class CartController extends ChangeNotifier {
  final Map<String, CartLine> _lines = {};

  List<CartLine> get lines =>
      _lines.values.toList()
        ..sort((a, b) => a.offer.shopName.compareTo(b.offer.shopName));

  int get count => _lines.values.fold(0, (sum, line) => sum + line.qty);
  int get subtotalCents =>
      _lines.values.fold(0, (sum, line) => sum + line.lineTotalCents);
  bool get isEmpty => _lines.isEmpty;

  CartLine? lineFor(Product product, ProductOffer offer) =>
      _lines['${offer.shopId}:${product.id}'];

  void add(Product product, ProductOffer offer) {
    final line = CartLine(product: product, offer: offer, qty: 1);
    _lines[line.key] =
        (_lines[line.key]?.copyWith(qty: _lines[line.key]!.qty + 1)) ?? line;
    notifyListeners();
  }

  void setQty(CartLine line, int qty) {
    if (qty <= 0) {
      _lines.remove(line.key);
    } else {
      _lines[line.key] = line.copyWith(qty: qty);
    }
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}

class PosLine {
  const PosLine({
    required this.product,
    required this.shopProductId,
    required this.unitPriceCents,
    required this.qty,
  });

  final Product product;
  final String shopProductId;
  final int unitPriceCents;
  final int qty;

  int get lineTotalCents => unitPriceCents * qty;

  PosLine copyWith({int? qty}) => PosLine(
    product: product,
    shopProductId: shopProductId,
    unitPriceCents: unitPriceCents,
    qty: qty ?? this.qty,
  );
}

class PosCartController extends ChangeNotifier {
  final Map<String, PosLine> _lines = {};

  List<PosLine> get lines => _lines.values.toList();
  int get subtotalCents =>
      _lines.values.fold(0, (sum, line) => sum + line.lineTotalCents);
  bool get isEmpty => _lines.isEmpty;

  void add(BarcodeLookupResult lookup) {
    final shopProduct = lookup.shopProduct;
    if (shopProduct == null) {
      throw const ApiException(
        code: 'ITEM_NOT_STOCKED',
        message: 'This barcode exists, but this shop does not stock it yet.',
      );
    }
    final line = PosLine(
      product: lookup.product,
      shopProductId: shopProduct.id,
      unitPriceCents: shopProduct.priceCents,
      qty: 1,
    );
    _lines[lookup.product.id] =
        _lines[lookup.product.id]?.copyWith(
          qty: _lines[lookup.product.id]!.qty + 1,
        ) ??
        line;
    notifyListeners();
  }

  void setQty(PosLine line, int qty) {
    if (qty <= 0) {
      _lines.remove(line.product.id);
    } else {
      _lines[line.product.id] = line.copyWith(qty: qty);
    }
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}

class OfflineSaleQueue extends ChangeNotifier {
  OfflineSaleQueue(this._prefs);

  final SharedPreferences _prefs;
  final _uuid = const Uuid();

  String _key(String shopId) => 'smartkasi.offlineSales.$shopId';

  List<Map<String, Object?>> read(String shopId) {
    final raw = _prefs.getString(_key(shopId));
    if (raw == null || raw.isEmpty) return [];
    final decoded = jsonDecode(raw);
    if (decoded is! List) return [];
    return decoded
        .whereType<Map>()
        .map((e) => Map<String, Object?>.from(e))
        .toList();
  }

  Future<void> queue(String shopId, Map<String, Object?> sale) async {
    final sales = read(shopId)..add(sale);
    await _prefs.setString(_key(shopId), jsonEncode(sales));
    notifyListeners();
  }

  Future<JsonMap> flush(String shopId, SmartKasiApi api) async {
    final sales = read(shopId);
    if (sales.isEmpty) {
      return {
        'summary': {'created': 0, 'duplicate': 0, 'failed': 0},
      };
    }

    // A 207 is a success for this endpoint. The caller must inspect every row.
    final response = await api.batchSales(shopId, sales);
    final results = asMapList(response['results']);
    final failedIds = results
        .where((row) => text(row['status']) == 'failed')
        .map((row) => text(row['client_sale_id']))
        .toSet();
    final remaining = sales
        .where((sale) => failedIds.contains(text(sale['client_sale_id'])))
        .toList();
    await _prefs.setString(_key(shopId), jsonEncode(remaining));
    notifyListeners();
    return response;
  }

  Map<String, Object?> buildSale({
    required List<PosLine> lines,
    required int amountTenderedCents,
  }) {
    final subtotal = lines.fold(0, (sum, line) => sum + line.lineTotalCents);
    return {
      // Generated once at sale time and persisted for every retry.
      'client_sale_id': _uuid.v4(),
      'sold_at': DateTime.now().toUtc().toIso8601String(),
      'payment_method': 'cash',
      'subtotal_cents': subtotal,
      'discount_cents': 0,
      'total_cents': subtotal,
      'amount_tendered_cents': amountTenderedCents,
      'change_cents': (amountTenderedCents - subtotal).clamp(0, 1 << 31),
      'items': [
        for (final line in lines)
          {
            'product_id': line.product.id,
            'qty': line.qty,
            'unit_price_cents': line.unitPriceCents,
          },
      ],
    };
  }
}

/// The till's local copy of its shop catalogue, kept warm by
/// `GET /shops/{shopId}/sync`.
///
/// Exists so the POS has something to price a scan against when there is no
/// signal. The endpoint returns each inventory row with its product embedded —
/// barcode included — so one pull is everything the till needs.
///
/// Stored as the server's own JSON rather than re-serialised models: a field
/// this app does not read yet still survives the round trip, and there is no
/// second mapping to keep in step with the contract.
class CatalogueSync extends ChangeNotifier {
  CatalogueSync(this._prefs);

  final SharedPreferences _prefs;

  /// In flight for any shop. A resume that lands while the launch pull is still
  /// running must not fire a second request for the same delta.
  bool isSyncing = false;

  /// The last pull's failure, or null. Being offline is the normal case here,
  /// not an error state — the cache stays usable and this is only for display.
  Object? lastError;

  /// Decoded per shop and held, because [label] and [count] are read during
  /// build — the POS rebuilds on every keystroke in the cash-tendered field,
  /// and decoding a few hundred rows per frame is not free on a R1500 phone.
  final _decoded = <String, JsonMap>{};

  String _key(String shopId) => 'smartkasi.catalogue.$shopId';

  JsonMap _read(String shopId) {
    final hit = _decoded[shopId];
    if (hit != null) return hit;
    final raw = _prefs.getString(_key(shopId));
    if (raw == null || raw.isEmpty) {
      return _decoded[shopId] = <String, dynamic>{};
    }
    final decoded = jsonDecode(raw);
    return _decoded[shopId] = decoded is Map
        ? Map<String, dynamic>.from(decoded)
        : <String, dynamic>{};
  }

  /// The `server_time` of the last successful pull, or null for a till that has
  /// never synced. Passing this back is what makes the next pull a delta.
  String? cursor(String shopId) => optionalText(_read(shopId)['cursor']);

  DateTime? lastSyncedAt(String shopId) {
    final value = optionalText(_read(shopId)['synced_at']);
    return value == null ? null : DateTime.tryParse(value)?.toLocal();
  }

  List<JsonMap> _rows(String shopId) => asMapList(_read(shopId)['items']);

  List<InventoryItem> items(String shopId) =>
      _rows(shopId).map(InventoryItem.fromJson).toList();

  int count(String shopId) => _rows(shopId).length;

  bool hasCatalogue(String shopId) => count(shopId) > 0;

  /// Cached lookup for the POS scan path.
  ///
  /// Returns null for a barcode this shop has never stocked, which the caller
  /// must tell apart from a network failure — the two need different words in
  /// front of a shop owner.
  InventoryItem? byBarcode(String shopId, String barcode) {
    final needle = barcode.trim();
    if (needle.isEmpty) return null;
    for (final row in _rows(shopId)) {
      final product = asMap(row['product']);
      if (optionalText(product['barcode'])?.trim() == needle) {
        return InventoryItem.fromJson(row);
      }
    }
    return null;
  }

  /// Pull whatever changed since the stored cursor and fold it into the cache.
  ///
  /// Never throws. A till that cannot reach the API on launch must still open
  /// on the catalogue it already has.
  Future<SyncDelta?> pull(
    String shopId,
    SmartKasiApi api, {
    bool full = false,
  }) async {
    // Already running for some shop — the caller gets the in-flight pull's
    // outcome by listening, not a second request. [lastError] stays as it was,
    // so a skipped pull never reads as a failed one.
    if (isSyncing) return null;
    isSyncing = true;
    lastError = null;
    notifyListeners();
    try {
      final delta = await api.syncShop(
        shopId,
        since: full ? null : cursor(shopId),
      );
      await _apply(shopId, delta);
      return delta;
    } catch (error) {
      lastError = error;
      return null;
    } finally {
      isSyncing = false;
      notifyListeners();
    }
  }

  Future<void> _apply(String shopId, SyncDelta delta) async {
    // A full snapshot replaces; a delta merges. Merging a snapshot would keep
    // rows the server has since stopped sending.
    final merged = <String, JsonMap>{};
    if (!delta.isFullSnapshot) {
      for (final row in _rows(shopId)) {
        merged[text(row['id'])] = row;
      }
    }
    for (final row in delta.inventoryJson) {
      merged[text(row['id'])] = row;
    }
    for (final id in delta.deletedShopProductIds) {
      merged.remove(id);
    }

    final next = <String, dynamic>{
      'cursor': delta.serverTime,
      'synced_at': DateTime.now().toUtc().toIso8601String(),
      'items': merged.values.toList(),
    };
    await _prefs.setString(_key(shopId), jsonEncode(next));
    _decoded[shopId] = next;
  }

  /// One line for the POS footer: how much is cached and how stale it is.
  String label(String shopId) {
    final total = count(shopId);
    if (total == 0) {
      return isSyncing ? 'Loading catalogue…' : 'No catalogue cached yet';
    }
    final at = lastSyncedAt(shopId);
    return '$total items cached${at == null ? '' : ' · synced ${_ago(at)}'}';
  }

  static String _ago(DateTime at) {
    final seconds = DateTime.now().difference(at).inSeconds;
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return '${seconds ~/ 60} min ago';
    if (seconds < 86400) return '${seconds ~/ 3600} h ago';
    return '${seconds ~/ 86400} d ago';
  }
}

class SmartKasiDependencies {
  SmartKasiDependencies({
    required this.config,
    required this.api,
    required this.auth,
    required this.theme,
    required this.cart,
    required this.posCart,
    required this.offlineSales,
    required this.catalogue,
  });

  final SmartKasiConfig config;
  final SmartKasiApi api;
  final AuthController auth;
  final ThemeController theme;
  final CartController cart;
  final PosCartController posCart;
  final OfflineSaleQueue offlineSales;
  final CatalogueSync catalogue;
}

class SmartKasiScope extends InheritedWidget {
  const SmartKasiScope({
    required this.dependencies,
    required super.child,
    super.key,
  });

  final SmartKasiDependencies dependencies;

  static SmartKasiDependencies of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<SmartKasiScope>();
    assert(scope != null, 'SmartKasiScope was not found in the widget tree.');
    return scope!.dependencies;
  }

  @override
  bool updateShouldNotify(SmartKasiScope oldWidget) =>
      dependencies != oldWidget.dependencies;
}

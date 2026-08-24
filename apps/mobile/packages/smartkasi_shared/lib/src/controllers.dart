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

class SmartKasiDependencies {
  SmartKasiDependencies({
    required this.config,
    required this.api,
    required this.auth,
    required this.theme,
    required this.cart,
    required this.posCart,
    required this.offlineSales,
  });

  final SmartKasiConfig config;
  final SmartKasiApi api;
  final AuthController auth;
  final ThemeController theme;
  final CartController cart;
  final PosCartController posCart;
  final OfflineSaleQueue offlineSales;
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

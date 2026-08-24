import 'package:flutter/material.dart';

import '../api.dart';
import '../controllers.dart';
import '../models.dart';
import '../ui/common.dart';

part 'shop_owner/context_gate.dart';
part 'shop_owner/dashboard.dart';
part 'shop_owner/pos.dart';
part 'shop_owner/inventory.dart';
part 'shop_owner/inventory_edit_sheet.dart';
part 'shop_owner/inventory_add_sheet.dart';
part 'shop_owner/orders.dart';
part 'shop_owner/account.dart';
part 'shop_owner/money_widgets.dart';

class ShopOwnerApplication extends StatefulWidget {
  const ShopOwnerApplication({super.key});

  @override
  State<ShopOwnerApplication> createState() => _ShopOwnerApplicationState();
}

class _ShopOwnerApplicationState extends State<ShopOwnerApplication> {
  int _index = 0;
  Shop? _shop;
  Future<Shop?>? _shopFuture;
  AuthController? _auth;
  String? _activeShopId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = SmartKasiScope.of(context).auth;
    if (_auth != auth) {
      _auth?.removeListener(_onAuthChanged);
      _auth = auth..addListener(_onAuthChanged);
    }
    _syncShopContext();
  }

  @override
  void dispose() {
    _auth?.removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    if (!mounted) return;
    setState(_syncShopContext);
  }

  void _syncShopContext() {
    final deps = SmartKasiScope.of(context);
    final profile = deps.auth.profile;
    final nextShopId = profile == null || profile.shopIds.isEmpty
        ? null
        : profile.shopIds.first;

    if (nextShopId == null) {
      _activeShopId = null;
      _shop = null;
      _shopFuture = null;
      return;
    }

    if (_activeShopId == nextShopId &&
        (_shop != null || _shopFuture != null)) {
      return;
    }

    _activeShopId = nextShopId;
    _shop = null;
    _shopFuture = deps.api.getShop(nextShopId).then((shop) {
      if (mounted && _activeShopId == shop.id) {
        setState(() {
          _shop = shop;
          _shopFuture = null;
        });
      }
      return shop;
    });
  }

  void _setShop(Shop shop) {
    setState(() {
      _activeShopId = shop.id;
      _shop = shop;
      _shopFuture = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final pages = [
      _ShopContextGate(
        shop: _shop,
        shopFuture: _shopFuture,
        childBuilder: (shop) => _DashboardScreen(shop: shop),
      ),
      _ShopContextGate(
        shop: _shop,
        shopFuture: _shopFuture,
        childBuilder: (shop) => _PosScreen(shop: shop),
      ),
      _ShopContextGate(
        shop: _shop,
        shopFuture: _shopFuture,
        childBuilder: (shop) => _InventoryScreen(shop: shop),
      ),
      _ShopContextGate(
        shop: _shop,
        shopFuture: _shopFuture,
        childBuilder: (shop) => _ShopOrdersScreen(shop: shop),
      ),
      _OwnerAccountScreen(shop: _shop, onShopChanged: _setShop),
    ];

    return AppPage(
      title: _shop?.name ?? deps.config.kind.title,
      subtitle: 'Sales, stock and incoming orders',
      leadingIcon: Icons.point_of_sale,
      actions: [
        IconButton(
          tooltip: 'Toggle theme',
          onPressed: deps.theme.toggle,
          icon: const Icon(Icons.contrast),
        ),
      ],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner),
            selectedIcon: Icon(Icons.point_of_sale),
            label: 'POS',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'Stock',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Account',
          ),
        ],
      ),
      child: pages[_index],
    );
  }
}

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/cupertino.dart' show CupertinoIcons;
import 'package:flutter/material.dart';

import '../api.dart';
import '../config.dart';
import '../controllers.dart';
import '../models.dart';
import '../ui/common.dart';

part 'customer/browse_screen.dart';
part 'customer/browse_data.dart';
part 'customer/browse_lists.dart';
part 'customer/browse_header.dart';
part 'customer/shop_cards.dart';
part 'customer/shop_detail_state.dart';
part 'customer/shop_products.dart';
part 'customer/shop_product_sheet.dart';
part 'customer/shop_info.dart';
part 'customer/browse_product_sheet.dart';
part 'customer/cart.dart';
part 'customer/orders.dart';
part 'customer/dish_builder.dart';
part 'customer/account.dart';

class CustomerApplication extends StatefulWidget {
  const CustomerApplication({super.key});

  @override
  State<CustomerApplication> createState() => _CustomerApplicationState();
}

class _CustomerApplicationState extends State<CustomerApplication> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final pages = [
      const _CustomerBrowseScreen(),
      const _CustomerCartScreen(),
      const _CustomerOrdersScreen(),
      const _DishBuilderScreen(),
      const _CustomerAccountScreen(),
    ];

    return AppPage(
      title: deps.config.kind.title,
      subtitle: 'Compare local spaza prices',
      leadingIcon: Icons.shopping_bag,
      showHeader: _index != 0,
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
        destinations: [
          const NavigationDestination(
            icon: Icon(CupertinoIcons.compass),
            selectedIcon: Icon(CupertinoIcons.compass),
            label: 'Browse',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: deps.cart.count > 0,
              label: Text('${deps.cart.count}'),
              child: const Icon(CupertinoIcons.bag),
            ),
            selectedIcon: const Icon(CupertinoIcons.bag),
            label: 'Basket',
          ),
          const NavigationDestination(
            icon: Icon(CupertinoIcons.doc_text),
            selectedIcon: Icon(CupertinoIcons.doc_text),
            label: 'Orders',
          ),
          const NavigationDestination(
            icon: Icon(CupertinoIcons.sparkles),
            selectedIcon: Icon(CupertinoIcons.sparkles),
            label: 'AI',
          ),
          const NavigationDestination(
            icon: Icon(CupertinoIcons.person),
            selectedIcon: Icon(CupertinoIcons.person),
            label: 'Account',
          ),
        ],
      ),
      child: pages[_index],
    );
  }
}

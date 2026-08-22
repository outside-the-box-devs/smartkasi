import 'package:flutter/material.dart';

import '../controllers.dart';
import '../models.dart';
import '../ui/common.dart';

part 'delivery/jobs.dart';
part 'delivery/active_delivery.dart';
part 'delivery/account.dart';
part 'delivery/delivery_utils.dart';

class DeliveryApplication extends StatefulWidget {
  const DeliveryApplication({super.key});

  @override
  State<DeliveryApplication> createState() => _DeliveryApplicationState();
}

class _DeliveryApplicationState extends State<DeliveryApplication> {
  int _index = 0;
  CourierDelivery? _active;

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final pages = [
      _CourierJobsScreen(
        onAccepted: (delivery) => setState(() {
          _active = delivery;
          _index = 1;
        }),
      ),
      _ActiveDeliveryScreen(
        delivery: _active,
        onChanged: (delivery) => setState(() => _active = delivery),
      ),
      const _CourierAccountScreen(),
    ];

    return AppPage(
      title: deps.config.kind.title,
      subtitle: 'Courier jobs and safe handovers',
      leadingIcon: Icons.delivery_dining,
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
            icon: Icon(Icons.route_outlined),
            selectedIcon: Icon(Icons.route),
            label: 'Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_shipping_outlined),
            selectedIcon: Icon(Icons.local_shipping),
            label: 'Active',
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

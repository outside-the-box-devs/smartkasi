part of '../delivery_app.dart';

class _CourierJobsScreen extends StatefulWidget {
  const _CourierJobsScreen({required this.onAccepted});

  final ValueChanged<CourierDelivery> onAccepted;

  @override
  State<_CourierJobsScreen> createState() => _CourierJobsScreenState();
}

class _CourierJobsScreenState extends State<_CourierJobsScreen> {
  late Future<List<CourierJob>> _future;
  String _modeFilter = 'all';
  Object? _error;
  bool _busy = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future = SmartKasiScope.of(context).api.courierJobs();
  }

  Future<void> _accept(CourierJob job) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final delivery = await SmartKasiScope.of(
        context,
      ).api.acceptJob(job.deliveryId);
      widget.onAccepted(delivery);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: RefreshIndicator(
        onRefresh: () async {
          setState(
            () => _future = SmartKasiScope.of(context).api.courierJobs(),
          );
          await _future;
        },
        child: ResponsiveList(
          children: [
            const ConfigBanner(),
            KasiHeroPanel(
              title: 'Earn on local runs',
              subtitle:
                  'Accept jobs matched to your delivery mode. Customer route visibility stays hidden.',
              icon: Icons.route,
              chips: [
                const KasiPill(label: 'Foot', icon: Icons.directions_walk),
                const KasiPill(label: 'Bike', icon: Icons.pedal_bike),
                KasiPill(
                  label: 'Vehicle',
                  icon: Icons.directions_car,
                  color: Colors.blue,
                ),
              ],
            ),
            KasiCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(
                        value: 'all',
                        label: Text('All'),
                        icon: Icon(Icons.all_inclusive),
                      ),
                      ButtonSegment(
                        value: 'foot',
                        label: Text('Foot'),
                        icon: Icon(Icons.directions_walk),
                      ),
                      ButtonSegment(
                        value: 'bicycle',
                        label: Text('Bike'),
                        icon: Icon(Icons.pedal_bike),
                      ),
                      ButtonSegment(
                        value: 'vehicle',
                        label: Text('Car'),
                        icon: Icon(Icons.directions_car),
                      ),
                    ],
                    selected: {_modeFilter},
                    onSelectionChanged: (value) =>
                        setState(() => _modeFilter = value.first),
                  ),
                ],
              ),
            ),
            if (_error != null) ErrorPanel(error: _error!),
            FutureSection<List<CourierJob>>(
              future: _future,
              builder: (context, jobs) {
                final visible = jobs
                    .where(
                      (job) => _modeFilter == 'all' || job.mode == _modeFilter,
                    )
                    .toList();
                if (visible.isEmpty) {
                  return const EmptyState(
                    icon: Icons.route_outlined,
                    title: 'No jobs in this mode',
                    message: 'Try another mode or pull to refresh.',
                  );
                }
                return Column(
                  children: [
                    for (final job in visible) ...[
                      _JobCard(
                        job: job,
                        busy: _busy,
                        onAccept: () => _accept(job),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({
    required this.job,
    required this.busy,
    required this.onAccept,
  });

  final CourierJob job;
  final bool busy;
  final VoidCallback onAccept;

  @override
  Widget build(BuildContext context) {
    final modeColor = _modeColor(context, job.mode);
    return KasiCard(
      padding: EdgeInsets.zero,
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 5,
              decoration: BoxDecoration(
                color: modeColor,
                borderRadius: const BorderRadius.horizontal(
                  left: Radius.circular(8),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            job.orderNumber,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w500),
                          ),
                        ),
                        StatusChip(job.mode, color: modeColor),
                      ],
                    ),
                    const SizedBox(height: 12),
                    MetricStrip(
                      children: [
                        StatTile(
                          label: 'pickups',
                          value: '${job.pickupCount}',
                          icon: Icons.storefront,
                          color: modeColor,
                        ),
                        StatTile(
                          label: 'distance',
                          value: distanceLabel(job.totalDistanceM),
                          icon: Icons.social_distance,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                zar(job.payoutCents),
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(fontWeight: FontWeight.w500),
                              ),
                              Text(
                                'Estimated payout',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        FilledButton.icon(
                          onPressed: busy ? null : onAccept,
                          icon: const Icon(Icons.check),
                          label: const Text('Accept'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

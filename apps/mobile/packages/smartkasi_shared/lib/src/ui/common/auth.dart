part of '../common.dart';

class ConfigBanner extends StatelessWidget {
  const ConfigBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    if (deps.config.hasSupabase) return const SizedBox.shrink();
    final scheme = Theme.of(context).colorScheme;
    return KasiCard(
      padding: const EdgeInsets.all(10),
      color: scheme.primary.withValues(alpha: 0.08),
      borderColor: scheme.primary.withValues(alpha: 0.18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.key_off, color: scheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Auth key missing',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w500,
                    color: scheme.primary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Public data works. Sign-in and protected actions need SUPABASE_ANON_KEY.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AuthPanel extends StatefulWidget {
  const AuthPanel({super.key});

  @override
  State<AuthPanel> createState() => _AuthPanelState();
}

class _AuthPanelState extends State<AuthPanel> {
  TextEditingController? _email;
  final _password = TextEditingController(text: 'Password123!');
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _email ??= TextEditingController(
      text: SmartKasiScope.of(context).config.kind.demoEmail,
    );
  }

  @override
  void dispose() {
    _email?.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final auth = deps.auth;
    final profile = auth.profile;
    final email = _email!;

    if (profile != null) {
      return KasiCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  child: Text(
                    profile.firstName.isEmpty
                        ? '?'
                        : profile.firstName.substring(0, 1).toUpperCase(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile.fullName,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w500),
                      ),
                      Text(profile.role.replaceAll('_', ' ')),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: auth.signOut,
              icon: const Icon(Icons.logout),
              label: const Text('Sign out'),
            ),
          ],
        ),
      );
    }

    return KasiCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Sign in as ${deps.config.kind.roleLabel}',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: auth.isBusy
                ? null
                : () async {
                    setState(() => _error = null);
                    try {
                      await auth.signIn(email.text, _password.text);
                    } catch (error) {
                      setState(
                        () => _error = error is ApiException
                            ? error.message
                            : error.toString(),
                      );
                    }
                  },
            icon: auth.isBusy
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.login),
            label: const Text('Sign in'),
          ),
        ],
      ),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final auth = SmartKasiScope.of(context).auth;
    if (!auth.didRestore || auth.isBusy) {
      return const Center(child: CircularProgressIndicator());
    }
    if (!auth.isSignedIn) {
      return const ResponsiveList(children: [ConfigBanner(), AuthPanel()]);
    }
    return child;
  }
}

class FutureSection<T> extends StatelessWidget {
  const FutureSection({
    required this.future,
    required this.builder,
    this.empty,
    super.key,
  });

  final Future<T> future;
  final Widget Function(BuildContext, T) builder;
  final Widget? empty;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ),
          );
        }
        if (snapshot.hasError) {
          return ErrorPanel(error: snapshot.error!);
        }
        final data = snapshot.data;
        if (data == null) return empty ?? const SizedBox.shrink();
        return builder(context, data);
      },
    );
  }
}

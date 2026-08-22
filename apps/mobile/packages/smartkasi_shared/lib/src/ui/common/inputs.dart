part of '../common.dart';

class KasiSearchField extends StatelessWidget {
  const KasiSearchField({
    required this.controller,
    required this.hintText,
    required this.onSubmitted,
    required this.onSearch,
    super.key,
  });

  final TextEditingController controller;
  final String hintText;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onSearch;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textInputAction: TextInputAction.search,
      onSubmitted: onSubmitted,
      decoration: InputDecoration(
        hintText: hintText,
        prefixIcon: const Icon(Icons.search),
        suffixIcon: IconButton(
          tooltip: 'Search',
          onPressed: onSearch,
          icon: const Icon(Icons.arrow_forward),
        ),
      ),
    );
  }
}

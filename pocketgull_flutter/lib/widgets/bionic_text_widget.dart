import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/bionic_reading_provider.dart';
import '../services/bionic_reading_service.dart';

/// Renders clinical text with Bionic Reading fixation stems when enabled.
class BionicTextWidget extends ConsumerWidget {
  final String text;
  final TextStyle? style;
  final TextStyle? boldStyle;

  const BionicTextWidget({
    super.key,
    required this.text,
    this.style,
    this.boldStyle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bionicState = ref.watch(bionicReadingProvider);
    final service = ref.watch(bionicReadingServiceProvider);

    if (!bionicState.isBionicEnabled) {
      return Text(text, style: style);
    }

    final tokens = service.tokenize(text);
    final spans = BionicReadingService.formatBionicSpans(
      tokens,
      normalStyle: style,
      boldStyle: boldStyle,
      isBionicEnabled: true,
    );

    return RichText(
      text: TextSpan(children: spans),
    );
  }
}

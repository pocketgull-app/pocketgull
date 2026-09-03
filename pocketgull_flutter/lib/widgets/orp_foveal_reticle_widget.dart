import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/bionic_reading_provider.dart';

/// Clinical Optimal Recognition Point (ORP) Foveal Reticle RSVP Stream Widget.
///
/// Anchors the patient's or clinician's foveal gaze on the center crosshair,
/// eliminating saccadic eye drift and enabling 300–900 WPM high-density reading.
class OrpFovealReticleWidget extends ConsumerWidget {
  final String? initialText;

  const OrpFovealReticleWidget({super.key, this.initialText});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(bionicReadingProvider);
    final notifier = ref.read(bionicReadingProvider.notifier);
    final token = state.currentToken;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF09090B), // Obsidian surface
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black54,
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Top Telemetry Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: state.isPlayingRsvp ? const Color(0xFF10B981) : const Color(0xFF6B7280),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'ORP FOVEAL RETICLE',
                    style: TextStyle(
                      color: Color(0xFFE2E8F0),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              if (token != null && token.category != 'standard')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: token.category == 'medication-tallman'
                        ? const Color(0xFF78350F)
                        : const Color(0xFF1E3A8A),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    token.category == 'medication-tallman' ? 'ISMP LASA' : 'MORPHEME',
                    style: TextStyle(
                      color: token.category == 'medication-tallman'
                          ? const Color(0xFFFDE68A)
                          : const Color(0xFFBFDBFE),
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Central Optical Reticle Viewport
          Container(
            height: 110,
            decoration: BoxDecoration(
              color: const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF3F3F46)),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Top & Bottom Optical Reticle Ticks
                Positioned(
                  top: 8,
                  child: Container(
                    width: 2,
                    height: 10,
                    color: const Color(0xFFEF4444).withValues(alpha: 0.8), // Red focal tick
                  ),
                ),
                Positioned(
                  bottom: 8,
                  child: Container(
                    width: 2,
                    height: 10,
                    color: const Color(0xFFEF4444).withValues(alpha: 0.8),
                  ),
                ),

                // Center Monospace Character Anchor Grid
                if (token != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        // Left of ORP (Right-aligned)
                        Expanded(
                          child: Text(
                            '${token.leadingPunct}${token.leftOfOrp}',
                            textAlign: TextAlign.right,
                            maxLines: 1,
                            overflow: TextOverflow.clip,
                            style: const TextStyle(
                              color: Color(0xFFF1F5F9),
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),

                        // ORP Center Character (Fixed width, highlighted in Red)
                        SizedBox(
                          width: 28,
                          child: Text(
                            token.orpChar,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFFEF4444), // Crimson focal anchor
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),

                        // Right of ORP (Left-aligned)
                        Expanded(
                          child: Text(
                            '${token.rightOfOrp}${token.trailingPunct}',
                            textAlign: TextAlign.left,
                            maxLines: 1,
                            overflow: TextOverflow.clip,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8), // Muted trailing letters
                              fontSize: 32,
                              fontWeight: FontWeight.w400,
                              fontFamily: 'monospace',
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  const Text(
                    'NO TEXT LOADED',
                    style: TextStyle(
                      color: Color(0xFF71717A),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      fontFamily: 'monospace',
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Progress & Token Counter
          if (state.tokens.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Token ${state.currentRsvpIndex + 1} of ${state.tokens.length}',
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
                Text(
                  '${state.rsvpSpeedWpm} WPM',
                  style: const TextStyle(
                    color: Color(0xFF38BDF8),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
            SliderTheme(
              data: SliderTheme.of(context).copyWith(
                thumbColor: const Color(0xFF38BDF8),
                activeTrackColor: const Color(0xFF0284C7),
                inactiveTrackColor: const Color(0xFF27272A),
                trackHeight: 3,
                thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              ),
              child: Slider(
                value: state.currentRsvpIndex.toDouble(),
                min: 0,
                max: (state.tokens.length - 1).clamp(0, 999999).toDouble(),
                onChanged: (val) {
                  notifier.jumpTo(val.round());
                },
              ),
            ),
          ],

          // Playback & Step Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.replay_5, color: Color(0xFF94A3B8), size: 22),
                tooltip: 'Back 5 tokens',
                onPressed: state.tokens.isEmpty ? null : () => notifier.step(-5),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF38BDF8),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(
                    state.isPlayingRsvp ? Icons.pause : Icons.play_arrow,
                    color: const Color(0xFF09090B),
                    size: 26,
                  ),
                  tooltip: state.isPlayingRsvp ? 'Pause' : 'Play RSVP',
                  onPressed: state.tokens.isEmpty ? null : () => notifier.togglePlay(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.forward_5, color: Color(0xFF94A3B8), size: 22),
                tooltip: 'Forward 5 tokens',
                onPressed: state.tokens.isEmpty ? null : () => notifier.step(5),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Speed Selector Chips
          Wrap(
            spacing: 6,
            children: [300, 450, 600, 750, 900].map((wpm) {
              final isSelected = state.rsvpSpeedWpm == wpm;
              return ChoiceChip(
                label: Text('$wpm WPM'),
                selected: isSelected,
                labelStyle: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                ),
                selectedColor: const Color(0xFF0284C7),
                backgroundColor: const Color(0xFF18181B),
                side: BorderSide(
                  color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFF27272A),
                ),
                onSelected: (selected) {
                  if (selected) notifier.setRsvpSpeed(wpm);
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

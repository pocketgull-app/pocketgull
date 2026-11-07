import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';

class ConsciousnessStateModel {
  final String id;
  final String name;
  final String subtitle;
  final String emoji;
  final Color themeColor;
  final String targetEEG;
  final List<String> targetNeurotransmitters;
  final Map<String, String> prescribedMeal;
  final Map<String, dynamic> avsTarget;
  final String clinicalRationale;
  final String tcmShenStatus;
  final String ayurvedicGuna;

  const ConsciousnessStateModel({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.emoji,
    required this.themeColor,
    required this.targetEEG,
    required this.targetNeurotransmitters,
    required this.prescribedMeal,
    required this.avsTarget,
    required this.clinicalRationale,
    required this.tcmShenStatus,
    required this.ayurvedicGuna,
  });
}

class MoodConsciousnessMatrixWidget extends ConsumerStatefulWidget {
  const MoodConsciousnessMatrixWidget({super.key});

  @override
  ConsumerState<MoodConsciousnessMatrixWidget> createState() => _MoodConsciousnessMatrixWidgetState();
}

class _MoodConsciousnessMatrixWidgetState extends ConsumerState<MoodConsciousnessMatrixWidget> {
  int _selectedStateIndex = 0;

  final List<ConsciousnessStateModel> _states = const [
    ConsciousnessStateModel(
      id: 'focus',
      name: 'Hyper-Focus',
      subtitle: 'Peak Cognition & Executive Flow',
      emoji: '⚡',
      themeColor: Color(0xFF6366F1),
      targetEEG: '40 Hz Gamma',
      targetNeurotransmitters: ['Dopamine D2', 'Acetylcholine', 'Norepinephrine'],
      prescribedMeal: {
        'emoji': '🍫',
        'name': 'Dark Cacao & L-Theanine Nootropic Elixir',
        'compounds': 'Theobromine 150mg + L-Theanine 200mg + Bacopa 300mg',
      },
      avsTarget: {
        'frequencyHz': 40.0,
        'waveType': 'Gamma',
        'breathingRateBpm': 6.0,
      },
      clinicalRationale: 'Enhances prefrontal cortex gamma coherence, upregulates cholinergic transmission, and sharpens executive memory.',
      tcmShenStatus: 'Shen Bright & Focused in Heart Channel',
      ayurvedicGuna: 'Rajas (Action)',
    ),
    ConsciousnessStateModel(
      id: 'calm',
      name: 'Meditative Calm',
      subtitle: 'Parasympathetic Vagal Tone',
      emoji: '🧘',
      themeColor: Color(0xFF10B981),
      targetEEG: '10 Hz Alpha',
      targetNeurotransmitters: ['GABA-A', 'Glycine', 'Serotonin 5-HT1A'],
      prescribedMeal: {
        'emoji': '🥑',
        'name': 'Avocado & Ashwagandha KSM-66 Compote',
        'compounds': 'Withanolides 30mg + Oleic Acid 14g + Magnesium 400mg',
      },
      avsTarget: {
        'frequencyHz': 10.0,
        'waveType': 'Alpha',
        'breathingRateBpm': 5.0,
      },
      clinicalRationale: 'Promotes alpha wave occipital dominance, blunts HPA axis cortisol hyper-secretion, and increases HRV.',
      tcmShenStatus: 'Shen Tranquilized & Anchored',
      ayurvedicGuna: 'Sattva (Purity)',
    ),
    ConsciousnessStateModel(
      id: 'sleep',
      name: 'Deep Rest',
      subtitle: 'Delta Glymphatic Clearance',
      emoji: '🌙',
      themeColor: Color(0xFFA855F7),
      targetEEG: '2 Hz Delta',
      targetNeurotransmitters: ['Melatonin', 'GABA-B', 'Adenosine'],
      prescribedMeal: {
        'emoji': '🫐',
        'name': 'Tart Cherry & Chamomile Apigenin Tonic',
        'compounds': 'Natural Melatonin 10mg + Apigenin 50mg + Glycine 3g',
      },
      avsTarget: {
        'frequencyHz': 2.0,
        'waveType': 'Delta',
        'breathingRateBpm': 4.0,
      },
      clinicalRationale: 'Facilitates slow-wave delta sleep entry, drives glymphatic metabolic waste clearance, and resets autonomic tone.',
      tcmShenStatus: 'Shen Preserved in Kidney Essence',
      ayurvedicGuna: 'Tamas (Rest)',
    ),
    ConsciousnessStateModel(
      id: 'creativity',
      name: 'Creative Reverie',
      subtitle: 'Hypnagogic Associative Insight',
      emoji: '🎨',
      themeColor: Color(0xFFF59E0B),
      targetEEG: '6 Hz Theta',
      targetNeurotransmitters: ['Anandamide', 'Dopamine D1', 'Acetylcholine'],
      prescribedMeal: {
        'emoji': '🫖',
        'name': 'Gotu Kola & Lion’s Mane Hericenones Brew',
        'compounds': 'Hericenones 50mg + Asiaticoside 20mg + Citral',
      },
      avsTarget: {
        'frequencyHz': 6.0,
        'waveType': 'Theta',
        'breathingRateBpm': 6.0,
      },
      clinicalRationale: 'Fosters theta hippocampal-cortical crosstalk, allowing novel associative synthesis and fluid ideation.',
      tcmShenStatus: 'Hun (Spiritual Soul) Floating Free',
      ayurvedicGuna: 'Sattva (Purity)',
    ),
    ConsciousnessStateModel(
      id: 'grounding',
      name: 'Anxiolytic',
      subtitle: 'Somatic Emotional Equilibrium',
      emoji: '🛡️',
      themeColor: Color(0xFFF43F5E),
      targetEEG: '8 Hz Low Alpha',
      targetNeurotransmitters: ['Endorphins', 'Neuropeptide Y', 'GABA'],
      prescribedMeal: {
        'emoji': '🍣',
        'name': 'Wild Salmon & Reishi Lingzhi Soup',
        'compounds': 'Ganoderic Acids 40mg + Omega-3 EPA 1.8g + Zinc 15mg',
      },
      avsTarget: {
        'frequencyHz': 8.0,
        'waveType': 'Alpha',
        'breathingRateBpm': 5.5,
      },
      clinicalRationale: 'Calms amygdala hyper-reactivity, tonifies TCM Spleen Qi and Heart Blood, and grounds somatic anxiety.',
      tcmShenStatus: 'Heart Blood Nourished & Shen Rooted',
      ayurvedicGuna: 'Sattva (Purity)',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final active = _states[_selectedStateIndex];

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: active.themeColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: active.themeColor.withValues(alpha: 0.8), blurRadius: 8),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'MOOD & CONSCIOUSNESS MATRIX',
                    style: TextStyle(
                      fontFamily: 'PocketGullMono',
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: isDark ? Colors.white : const Color(0xFF18181B),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: active.themeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: active.themeColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  active.name.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'PocketGullMono',
                    color: active.themeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Spectrum State Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_states.length, (index) {
                final st = _states[index];
                final isSelected = index == _selectedStateIndex;

                return GestureDetector(
                  onTap: () => setState(() => _selectedStateIndex = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? st.themeColor.withValues(alpha: 0.15)
                          : (isDark ? const Color(0xFF18181B) : const Color(0xFFF4F4F5)),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? st.themeColor : Colors.transparent,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(st.emoji, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 6),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              st.name,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? (isDark ? Colors.white : Colors.black)
                                    : (isDark ? Colors.grey.shade400 : Colors.grey.shade700),
                              ),
                            ),
                            Text(
                              st.targetEEG,
                              style: TextStyle(
                                fontSize: 8,
                                fontFamily: 'PocketGullMono',
                                color: st.themeColor,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 20),

          // Interventions Grid
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. AVS Target
                Row(
                  children: [
                    const Text('🧠', style: TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'AVS ENTRAINMENT & VAGAL RESONANCE',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'PocketGullMono',
                              color: active.themeColor,
                            ),
                          ),
                          Text(
                            '${active.avsTarget['waveType']} Wave (${active.avsTarget['frequencyHz']} Hz) • ${active.avsTarget['breathingRateBpm']} BPM Breathing',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        final note = '🔮 Applied AVS State: ${active.emoji} ${active.name} (${active.avsTarget['waveType']} ${active.avsTarget['frequencyHz']} Hz)';
                        ref.read(patientProvider.notifier).addNote(note);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(note), backgroundColor: active.themeColor),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: active.themeColor,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Apply', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const Divider(height: 24),

                // 2. Culinary Micro-Dosing
                Row(
                  children: [
                    Text(active.prescribedMeal['emoji']!, style: const TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'CULINARY MICRO-DOSING INTERVENTION',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'PocketGullMono',
                              color: Color(0xFF10B981),
                            ),
                          ),
                          Text(
                            active.prescribedMeal['name']!,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            active.prescribedMeal['compounds']!,
                            style: TextStyle(fontSize: 9, fontFamily: 'PocketGullMono', color: Colors.grey.shade400),
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton(
                      onPressed: () {
                        final note = '🥑 Prescribed Mood Meal: ${active.prescribedMeal['emoji']} ${active.prescribedMeal['name']}';
                        ref.read(patientProvider.notifier).addNote(note);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(note), backgroundColor: const Color(0xFF10B981)),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        minimumSize: Size.zero,
                        side: const BorderSide(color: Color(0xFF10B981)),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Prescribe', style: TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Clinical Rationale & Neurotransmitters
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: active.themeColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: active.themeColor.withValues(alpha: 0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Target Neurotransmitters: ${active.targetNeurotransmitters.join(', ')}',
                      style: TextStyle(fontSize: 10, fontFamily: 'PocketGullMono', fontWeight: FontWeight.bold, color: active.themeColor),
                    ),
                    Text(
                      active.ayurvedicGuna,
                      style: TextStyle(fontSize: 9, fontFamily: 'PocketGullMono', color: Colors.grey.shade400),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  active.clinicalRationale,
                  style: TextStyle(fontSize: 11, height: 1.4, color: isDark ? Colors.grey.shade300 : Colors.grey.shade800),
                ),
              ],
            ),
          ),

        ],
      ),
    );
  }
}

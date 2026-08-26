import 'package:flutter/material.dart';

class MovementQuestScreen extends StatefulWidget {
  const MovementQuestScreen({super.key});

  @override
  State<MovementQuestScreen> createState() => _MovementQuestScreenState();
}

class _MovementQuestScreenState extends State<MovementQuestScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _breathingController;
  late Animation<double> _breathingAnimation;

  int _vagalPoints = 0;
  bool _isEmergencySanctuaryActive = false;

  final List<Map<String, dynamic>> _milestones = [
    {
      'id': 'm-1',
      'order': 1,
      'title': 'Canopy Immersion Gate',
      'distance': '180m',
      'canopy': '85%',
      'instruction': 'Walk under the shaded cedar canopy past the stone water fountain.',
      'grounding': 'Notice 3 distinct shades of green above you.',
      'points': 40,
      'completed': false,
    },
    {
      'id': 'm-2',
      'order': 2,
      'title': 'Acoustic Grounding Waypoint',
      'distance': '250m',
      'canopy': '88%',
      'instruction': 'Traverse the quiet pedestrian path with noise levels below 45 dBA.',
      'grounding': 'Take 5 gentle deep belly breaths (4s in, 6s out).',
      'points': 50,
      'completed': false,
    },
    {
      'id': 'm-3',
      'order': 3,
      'title': 'Sanctuary Bench & Vagal Reset',
      'distance': '220m',
      'canopy': '92%',
      'instruction': 'Arrive at the peaceful garden bench under the cedar pavilion.',
      'grounding': 'Complete one 4-7-8 calming parasympathetic breathing cycle.',
      'points': 60,
      'completed': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _breathingAnimation = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _breathingController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _breathingController.dispose();
    super.dispose();
  }

  void _completeMilestone(int index) {
    if (!_milestones[index]['completed']) {
      setState(() {
        _milestones[index]['completed'] = true;
        _vagalPoints += (_milestones[index]['points'] as int);
      });
    }
  }

  void _toggleEmergencySanctuary() {
    setState(() {
      _isEmergencySanctuaryActive = !_isEmergencySanctuaryActive;
    });
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = _milestones.where((m) => m['completed'] == true).length;
    final progressPct = ((completedCount / _milestones.length) * 100).round();

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        title: const Row(
          children: [
            Text('🌿 ', style: TextStyle(fontSize: 20)),
            Text(
              'Biophilic Vagal Odyssey',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFFF4F4F5),
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF059669)),
                ),
                child: Text(
                  '$_vagalPoints pts',
                  style: const TextStyle(
                    color: Color(0xFF6EE7B7),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Emergency Sanctuary Card
            Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: _isEmergencySanctuaryActive
                    ? const Color(0xFF451A03)
                    : const Color(0xFF18181B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isEmergencySanctuaryActive
                      ? const Color(0xFFD97706)
                      : const Color(0xFF27272A),
                ),
              ),
              child: Row(
                children: [
                  const Text('🚨', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isEmergencySanctuaryActive
                              ? 'Sanctuary Egress Active'
                              : 'Emergency Sanctuary Finder',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _isEmergencySanctuaryActive
                                ? const Color(0xFFFDE68A)
                                : const Color(0xFFE4E4E7),
                          ),
                        ),
                        Text(
                          _isEmergencySanctuaryActive
                              ? 'Route to Central Botanical Haven (3 min walk)'
                              : 'One-touch guidance to nearest quiet haven & AED',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFFA1A1AA),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _toggleEmergencySanctuary,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isEmergencySanctuaryActive
                          ? const Color(0xFFB45309)
                          : const Color(0xFF27272A),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(44, 44),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      _isEmergencySanctuaryActive ? 'Cancel' : 'Sanctuary',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 4-7-8 Breathing Circle Pacer Card
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                children: [
                  const Text(
                    'PARASYMPATHETIC 4-7-8 BREATHING PACER',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: Color(0xFF38BDF8),
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 16),
                  ScaleTransition(
                    scale: _breathingAnimation,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF0284C7).withValues(alpha: 0.2),
                        border: Border.all(color: const Color(0xFF38BDF8), width: 2),
                      ),
                      child: const Center(
                        child: Text(
                          'Breathe',
                          style: TextStyle(
                            color: Color(0xFFE0F2FE),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Inhale 4s · Hold 7s · Exhale 8s',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Milestones Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'MOVEMENT MILESTONES',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    color: Color(0xFFA1A1AA),
                    fontFamily: 'monospace',
                  ),
                ),
                Text(
                  '$progressPct% Complete',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF34D399),
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Milestones List
            ...List.generate(_milestones.length, (index) {
              final m = _milestones[index];
              final isCompleted = m['completed'] as bool;

              return Container(
                margin: const EdgeInsets.only(bottom: 12.0),
                padding: const EdgeInsets.all(14.0),
                decoration: BoxDecoration(
                  color: isCompleted
                      ? const Color(0xFF064E3B).withValues(alpha: 0.3)
                      : const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isCompleted
                        ? const Color(0xFF059669)
                        : const Color(0xFF27272A),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? const Color(0xFF059669)
                                    : const Color(0xFF27272A),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  isCompleted ? '✓' : '${m['order']}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isCompleted ? Colors.white : const Color(0xFFA1A1AA),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              m['title'] as String,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF4F4F5),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF064E3B),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '+${m['points']} pts',
                            style: const TextStyle(
                              fontSize: 10,
                              color: Color(0xFF6EE7B7),
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      m['instruction'] as String,
                      style: const TextStyle(fontSize: 12, color: Color(0xFFD4D4D8)),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF09090B),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF27272A)),
                      ),
                      child: Row(
                        children: [
                          const Text('🧘 ', style: TextStyle(fontSize: 12)),
                          Expanded(
                            child: Text(
                              m['grounding'] as String,
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF6EE7B7),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerRight,
                      child: isCompleted
                          ? const Text(
                              '✓ Completed',
                              style: TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : ElevatedButton(
                              onPressed: () => _completeMilestone(index),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF059669),
                                foregroundColor: Colors.white,
                                minimumSize: const Size(80, 44),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Arrived 🎯', style: TextStyle(fontSize: 12)),
                            ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

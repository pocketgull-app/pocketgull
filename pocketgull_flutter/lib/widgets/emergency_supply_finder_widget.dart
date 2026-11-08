import 'package:flutter/material.dart';

class EmergencySupplyItem {
  final String icon;
  final String title;
  final String category;
  final String distanceStr;
  final String locationName;
  final String actionText;
  final Color badgeColor;

  EmergencySupplyItem({
    required this.icon,
    required this.title,
    required this.category,
    required this.distanceStr,
    required this.locationName,
    required this.actionText,
    required this.badgeColor,
  });
}

class EmergencySupplyFinderWidget extends StatefulWidget {
  const EmergencySupplyFinderWidget({super.key});

  @override
  State<EmergencySupplyFinderWidget> createState() => _EmergencySupplyFinderWidgetState();
}

class _EmergencySupplyFinderWidgetState extends State<EmergencySupplyFinderWidget> {
  final String gpsLocation = 'Lat 44.0978° N, Lon -70.2172° W';

  final List<EmergencySupplyItem> supplies = [
    EmergencySupplyItem(
      icon: '⚡',
      title: 'Public Defibrillator (AED)',
      category: 'CARDIAC ARREST',
      distanceStr: '0.1 mi · 2 min walk',
      locationName: 'Community Center Lobby',
      actionText: 'Get Navigation',
      badgeColor: Colors.redAccent,
    ),
    EmergencySupplyItem(
      icon: '🍊',
      title: 'Fast-Acting Glucose / Juice',
      category: 'HYPOGLYCEMIA',
      distanceStr: '0.2 mi · 3 min walk',
      locationName: '24/7 Corner Pharmacy',
      actionText: 'Directions',
      badgeColor: Colors.amber,
    ),
    EmergencySupplyItem(
      icon: '🩹',
      title: 'Trauma & First Aid Kit',
      category: 'HEMORRHAGE CONTROL',
      distanceStr: '0.3 mi · 4 min walk',
      locationName: 'Municipal Fire Station 2',
      actionText: 'Call Station',
      badgeColor: Colors.orange,
    ),
    EmergencySupplyItem(
      icon: '🏥',
      title: 'Level 1 Trauma Center ER',
      category: 'CRITICAL CARE',
      distanceStr: '1.4 mi · 5 min drive',
      locationName: 'St. Mary\'s Regional Medical',
      actionText: 'Route ER',
      badgeColor: Colors.blueAccent,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B), // Dark zinc background
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.redAccent.withValues(alpha: 0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.redAccent.withValues(alpha: 0.1),
            blurRadius: 10,
            spreadRadius: 2,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Text('🚑', style: TextStyle(fontSize: 18)),
                  SizedBox(width: 8),
                  Text(
                    'EMERGENCY RADAR & SUPPLIES',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: const Text(
                  'GPS ACTIVE',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'GPS Coordinates: $gpsLocation',
            style: TextStyle(fontSize: 10, fontFamily: 'PocketGullMono', color: Colors.grey[400]),
          ),
          const SizedBox(height: 12),

          // Cards Grid
          Column(
            children: supplies.map((item) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF3F3F46).withValues(alpha: 0.5)),
                ),
                child: Row(
                  children: [
                    Text(item.icon, style: const TextStyle(fontSize: 22)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                decoration: BoxDecoration(
                                  color: item.badgeColor.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  item.category,
                                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: item.badgeColor),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  item.distanceStr,
                                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.title,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            item.locationName,
                            style: const TextStyle(fontSize: 10, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        minimumSize: const Size(0, 32),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Opening Navigation to ${item.locationName}...')),
                        );
                      },
                      child: Text(
                        item.actionText,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

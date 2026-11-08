import 'package:flutter/material.dart';
import '../services/clinical_intelligence_service.dart';

class ReportTabsWidget extends StatelessWidget {
  final AnalysisLens activeLens;
  final void Function(AnalysisLens) onLensChanged;

  const ReportTabsWidget({
    super.key,
    required this.activeLens,
    required this.onLensChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: AnalysisLens.values.length,
        itemBuilder: (context, index) {
          final lens = AnalysisLens.values[index];
          final isActive = lens == activeLens;

          return InkWell(
            onTap: () => onLensChanged(lens),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isActive ? const Color(0xFF1C1C1C) : Colors.transparent,
                    width: 2,
                  ),
                ),
              ),
              child: Center(
                child: Text(
                  lens.title.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    color: isActive ? const Color(0xFF1C1C1C) : Colors.grey,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Research Tab Widget — Displays scientific protein homolog matches (BLAST/MMseqs2).
///
/// Flutter parity with Angular `research-tab.component.ts` (71 lines).
library;

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ProteinHit {
  final String id;
  final String name;
  final String identity;
  final String evalue;

  const ProteinHit({
    required this.id,
    required this.name,
    required this.identity,
    required this.evalue,
  });
}

class ResearchTabWidget extends StatelessWidget {
  final List<ProteinHit>? hits;

  const ResearchTabWidget({super.key, this.hits});

  Future<void> _launchUrl(String id) async {
    final uri = Uri.parse('https://www.uniprot.org/uniprotkb/$id/entry');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasHits = hits != null && hits!.isNotEmpty;

    return Container(
      color: isDark ? const Color(0xFF09090B) : const Color(0xFFFAFAFA),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Row(
            children: [
              Container(
                width: 8, height: 8,
                decoration: const BoxDecoration(
                  color: Colors.indigo,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'SCIENTIFIC RESEARCH',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // ── Content Area ──
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF18181B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
                ),
              ),
              child: !hasHits
                  ? _buildEmptyState(isDark)
                  : _buildResultsTable(context, isDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.science_outlined,
          size: 48,
          color: isDark ? const Color(0xFF3F3F46) : const Color(0xFFD4D4D8),
        ),
        const SizedBox(height: 16),
        Text(
          'No active research requests.',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Text(
            'When the AI agent invokes science skills (like protein searches), results will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResultsTable(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(
            isDark ? const Color(0xFF27272A).withValues(alpha: 0.5) : const Color(0xFFF4F4F5),
          ),
          columns: const [
            DataColumn(
              label: Text(
                'Target ID',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ),
            DataColumn(
              label: Text(
                'Protein Name',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ),
            DataColumn(
              label: Text(
                'Identity',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ),
            DataColumn(
              label: Text(
                'E-Value',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ),
          ],
          rows: hits!.map((hit) {
            return DataRow(
              cells: [
                DataCell(
                  InkWell(
                    onTap: () => _launchUrl(hit.id),
                    child: Text(
                      hit.id,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.indigoAccent,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
                DataCell(
                  Text(
                    hit.name,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                    ),
                  ),
                ),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      hit.identity,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ),
                ),
                DataCell(
                  Text(
                    hit.evalue,
                    style: TextStyle(
                      fontSize: 12,
                      fontFamily: 'PocketGullMono',
                      color: Colors.grey.shade500,
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

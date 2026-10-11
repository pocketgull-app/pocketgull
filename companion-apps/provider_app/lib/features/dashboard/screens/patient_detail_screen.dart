import 'package:flutter/material.dart';
import '../../../../core/models/patient.dart';
import '../../field_kit/screens/multilingual_passport_screen.dart';
import 'provider_dashboard.dart';

class PatientDetailScreen extends StatefulWidget {
  final Patient patient;

  const PatientDetailScreen({super.key, required this.patient});

  @override
  State<PatientDetailScreen> createState() => _PatientDetailScreenState();
}

class _PatientDetailScreenState extends State<PatientDetailScreen> {
  String _nudgeStatus = 'idle'; // 'idle', 'sending', 'sent'

  Future<void> _sendNudge() async {
    if (_nudgeStatus != 'idle') return;

    setState(() => _nudgeStatus = 'sending');

    // Simulate sending API nudge to patient companion app
    await Future.delayed(const Duration(milliseconds: 1500));

    if (mounted) {
      setState(() => _nudgeStatus = 'sent');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nudge sent to patient device.'),
          backgroundColor: Colors.green,
        ),
      );

      // Revert button back to normal after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() => _nudgeStatus = 'idle');
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    final double screenWidth = MediaQuery.of(context).size.width;
    final double screenHeight = MediaQuery.of(context).size.height;
    final bool isWatch = screenWidth < 240 || screenHeight < 320;
    final bool isSmallPhone = screenWidth < 360 || screenHeight < 640;

    final double outerPadding = isWatch ? 8.0 : (isSmallPhone ? 16.0 : 24.0);
    final double sectionSpacing = isWatch ? 16.0 : (isSmallPhone ? 24.0 : 32.0);
    final double sectionTitleFontSize = isWatch ? 9.0 : 12.0;
    final double labelFontSize = isWatch ? 10.0 : 13.0;
    final double valueFontSize = isWatch ? 10.0 : 14.0;
    final double infoRowSpacing = isWatch ? 6.0 : 12.0;
    final double cardPadding = isWatch ? 10.0 : (isSmallPhone ? 14.0 : 20.0);
    final double warningIconSize = isWatch ? 16.0 : 20.0;
    final double warningTextFontSize = isWatch ? 9.0 : 14.0;
    final double buttonVerticalPadding = isWatch ? 10.0 : (isSmallPhone ? 12.0 : 16.0);

    // Mock up some clinical gap conditions based on patient data
    final vitals = widget.patient.state.vitals;
    final bool missingRecentHr = !vitals.containsKey('hr') || (vitals['hr'] as String).isEmpty;
    final bool missingRecentBp = !vitals.containsKey('bp') || (vitals['bp'] as String).isEmpty;
    final bool hasClinicalGaps = missingRecentHr || missingRecentBp;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(widget.patient.name.toUpperCase(), style: TextStyle(letterSpacing: 2, fontSize: isWatch ? 11 : 14)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: ListView(
        padding: EdgeInsets.all(outerPadding),
        children: [
          // Hero Transition Header
          Center(
            child: Column(
              children: [
                Hero(
                  tag: 'avatar-${widget.patient.id}',
                  child: CircleAvatar(
                    backgroundColor: getPatientAvatarColor(widget.patient.id, isDark),
                    radius: isWatch ? 24 : 48,
                    child: Text(
                      getPatientInitials(widget.patient.name),
                      style: TextStyle(
                        color: getPatientAvatarTextColor(widget.patient.id, isDark),
                        fontWeight: FontWeight.bold,
                        fontSize: isWatch ? 14 : 28,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  widget.patient.name,
                  style: TextStyle(
                    fontSize: isWatch ? 14 : 20,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),

          _buildInfoRow('AGE', widget.patient.age.toString(), textColor, subColor, labelFontSize, valueFontSize, infoRowSpacing),
          _buildInfoRow('GENDER', widget.patient.gender, textColor, subColor, labelFontSize, valueFontSize, infoRowSpacing),
          _buildInfoRow('LAST VISIT', widget.patient.lastVisit, textColor, subColor, labelFontSize, valueFontSize, infoRowSpacing),
          _buildInfoRow('DELEGATION CODE', widget.patient.id, textColor, subColor, labelFontSize, valueFontSize, infoRowSpacing),
          
          SizedBox(height: sectionSpacing),
          _buildSectionTitle('LATEST VITALS', textColor, sectionTitleFontSize),
          const SizedBox(height: 16),
          if (vitals.isEmpty)
            Text('No vitals recorded.', style: TextStyle(color: subColor, fontSize: valueFontSize))
          else
            ...vitals.entries.map((e) => _buildInfoRow(e.key.toUpperCase(), e.value.toString(), textColor, subColor, labelFontSize, valueFontSize, infoRowSpacing)),
 
          SizedBox(height: sectionSpacing),

          if (hasClinicalGaps) ...[
            _buildSectionTitle('CLINICAL GAPS', const Color(0xFFDC2626), sectionTitleFontSize),
            const SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(cardPadding),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF450A0A).withValues(alpha: 0.3) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFECACA)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, color: const Color(0xFFDC2626), size: warningIconSize),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Missing Baseline Data',
                          style: TextStyle(fontSize: valueFontSize, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFF991B1B)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'No recent resting heart rate or blood pressure recorded. Patient should sync their Health Connect app.',
                    style: TextStyle(height: 1.5, color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFF991B1B), fontSize: warningTextFontSize),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _nudgeStatus == 'sent'
                            ? Colors.green
                            : (_nudgeStatus == 'sending'
                                ? (isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFCA5A5))
                                : (isDark ? const Color(0xFFDC2626) : const Color(0xFFEF4444))),
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: buttonVerticalPadding),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: _nudgeStatus == 'idle' ? _sendNudge : null,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (_nudgeStatus == 'sending') ...[
                            const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            ),
                            const SizedBox(width: 8),
                          ] else if (_nudgeStatus == 'sent') ...[
                            const Icon(Icons.check, color: Colors.white, size: 16),
                            const SizedBox(width: 8),
                          ],
                          Text(
                            _nudgeStatus == 'sent'
                                ? 'PATIENT NUDGED'
                                : (_nudgeStatus == 'sending' ? 'SENDING NUDGE...' : 'NUDGE PATIENT FOR DATA'),
                            style: TextStyle(fontSize: isWatch ? 10 : 12, letterSpacing: 1.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          ] else ...[
            _buildSectionTitle('CLINICAL GAPS', Colors.green, sectionTitleFontSize),
            const SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(isWatch ? 10.0 : 16.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF064E3B).withValues(alpha: 0.3) : const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF065F46) : const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle_outline, color: Colors.green, size: warningIconSize),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('All baseline clinical markers are up to date.', style: TextStyle(fontSize: warningTextFontSize, color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF166534))),
                  )
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          _buildSectionTitle('CROSS-BORDER EMERGENCY PASSPORT', const Color(0xFF7C3AED), sectionTitleFontSize),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF7C3AED),
                side: const BorderSide(color: Color(0xFF7C3AED)),
                padding: EdgeInsets.symmetric(vertical: buttonVerticalPadding),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              icon: const Icon(Icons.qr_code_2_outlined, size: 18),
              label: Text(
                'GENERATE 6-LANGUAGE QR PASSPORT',
                style: TextStyle(fontSize: isWatch ? 10 : 12, letterSpacing: 1.2, fontWeight: FontWeight.bold),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MultilingualPassportScreen(patient: widget.patient)),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color, double fontSize) {
    return Text(
      title,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
        color: color,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, Color labelColor, Color valueColor, double labelSize, double valueSize, double bottomPadding) {
    return Padding(
      padding: EdgeInsets.only(bottom: bottomPadding),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: labelColor, fontWeight: FontWeight.bold, fontSize: labelSize, letterSpacing: 1)),
          Text(value, style: TextStyle(color: valueColor, fontSize: valueSize)),
        ],
      ),
    );
  }
}

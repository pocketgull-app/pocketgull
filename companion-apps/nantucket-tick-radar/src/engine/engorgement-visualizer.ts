export interface IEngorgementStage {
  hours: number;
  label: string;
  sizeMm: number;
  massMg: number;
  everydayObjectComparison: string;
  scutellumRatio: string;
  bacterialState: string;
  ospSwitchState: 'OspA Dormant' | 'OspA -> OspC Switch Activated' | 'Midgut Breakthrough' | 'Active Salivary Injection' | 'Max Multi-Vector Transfusion';
  transmissionRiskPercent: number;
  doxycyclineIndicated: boolean;
  clinicalAction: string;
  visualColor: string;
}

export const ENGORGEMENT_STAGES: IEngorgementStage[] = [
  {
    hours: 0,
    label: 'Flat / Unattached',
    sizeMm: 1.0,
    massMg: 0.4,
    everydayObjectComparison: 'Poppy Seed',
    scutellumRatio: 'Scutellum covers ~50% of flat dorsal surface',
    bacterialState: 'Spirochetes (Borrelia) are dormant, anchored tightly to the midgut lining by Outer Surface Protein A (OspA).',
    ospSwitchState: 'OspA Dormant',
    transmissionRiskPercent: 0.5,
    doxycyclineIndicated: false,
    clinicalAction: 'Cleanse bite site with 70% alcohol or soap and water. No prophylactic antibiotics needed.',
    visualColor: '#10b981'
  },
  {
    hours: 24,
    label: 'Early Attachment (24h)',
    sizeMm: 1.8,
    massMg: 1.2,
    everydayObjectComparison: 'Sesame Seed',
    scutellumRatio: 'Abdomen begins slight dorsoventral expansion',
    bacterialState: 'Warm host blood (37°C) triggers bacterial gene expression: downregulating OspA and synthesizing OspC.',
    ospSwitchState: 'OspA -> OspC Switch Activated',
    transmissionRiskPercent: 3.5,
    doxycyclineIndicated: false,
    clinicalAction: 'Standard 30-day vigilance. Watch for expanding redness (>5cm) or fever.',
    visualColor: '#38bdf8'
  },
  {
    hours: 36,
    label: 'IDSA Prophylaxis Threshold (36h)',
    sizeMm: 2.5,
    massMg: 3.8,
    everydayObjectComparison: 'Small Lentil',
    scutellumRatio: 'Body is noticeably swollen; alloscutum outgrows shield',
    bacterialState: 'Spirochetes detach from midgut cells, cross the gut basement membrane into the hemolymph (tick blood).',
    ospSwitchState: 'Midgut Breakthrough',
    transmissionRiskPercent: 18.0,
    doxycyclineIndicated: true,
    clinicalAction: 'IDSA Clinical Criteria Met: Single-dose Doxycycline (200 mg) recommended within 72h of removal.',
    visualColor: '#fbbf24'
  },
  {
    hours: 48,
    label: 'Advanced Engorgement (48h)',
    sizeMm: 3.8,
    massMg: 8.5,
    everydayObjectComparison: 'Split Pea',
    scutellumRatio: 'Hard dark scutellum looks like a small button on front of swollen body',
    bacterialState: 'Spirochetes invade salivary glands and are actively injected into human dermal capillaries during salivation pulses.',
    ospSwitchState: 'Active Salivary Injection',
    transmissionRiskPercent: 55.0,
    doxycyclineIndicated: true,
    clinicalAction: 'STAT Doxycycline Prophylaxis indicated. If >72h since removal, monitor closely for 10-14 day treatment.',
    visualColor: '#f97316'
  },
  {
    hours: 72,
    label: 'Fully Engorged (72h+)',
    sizeMm: 5.5,
    massMg: 22.0,
    everydayObjectComparison: 'Plump Raisin / Coffee Bean',
    scutellumRatio: 'Shield is tiny compared to massive gray-blue body',
    bacterialState: 'High-volume bacterial and protozoan transfusion. Multiple pathogens (Lyme, Babesia, Anaplasma) transmitted.',
    ospSwitchState: 'Max Multi-Vector Transfusion',
    transmissionRiskPercent: 88.0,
    doxycyclineIndicated: true,
    clinicalAction: 'High risk of acute transmission. Urgent medical evaluation at Nantucket Cottage Hospital Walk-in.',
    visualColor: '#ef4444'
  }
];

export function getEngorgementStageForHours(hours: number): IEngorgementStage {
  if (hours <= 12) return ENGORGEMENT_STAGES[0];
  if (hours <= 30) return ENGORGEMENT_STAGES[1];
  if (hours <= 42) return ENGORGEMENT_STAGES[2];
  if (hours <= 60) return ENGORGEMENT_STAGES[3];
  return ENGORGEMENT_STAGES[4];
}

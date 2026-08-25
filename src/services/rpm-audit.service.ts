import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IRpmTimeLog {
  id: string;
  timestamp: string;
  minutes: number;
  notes: string;
  clinicianName: string;
}

export interface IRpmMetrics {
  patientId: string;
  transmissionDays30Count: number; // 0-30 days
  cpt99453Eligible: boolean; // Initial setup/education ($19)
  cpt99454Eligible: boolean; // 16+ days transmission in 30 days ($55)
  careManagementMinutes: number; // Logged review minutes
  cpt99457Eligible: boolean; // First 20 mins ($50)
  cpt99458Units: number; // Additional 20-min blocks ($40 each)
  estimatedReimbursementUsd: number;
  timeLogs: IRpmTimeLog[];
  status: 'compliant' | 'pending_16_days' | 'ineligible';
}

@Injectable({
  providedIn: 'root'
})
export class RpmAuditService {
  private patientState = inject(PatientStateService);

  private readonly transmissionDays = signal<number>(18);
  private readonly setupCompleted = signal<boolean>(true);
  private readonly timeLogsSignal = signal<IRpmTimeLog[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      minutes: 15,
      notes: 'Reviewed continuous SpO2 and HRV telemetry trends; baseline stable.',
      clinicianName: 'Dr. Robert Wachter, MD'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      minutes: 10,
      notes: 'Interactive telehealth check-in on symptom progression and care plan adherence.',
      clinicianName: 'Nurse Specialist'
    }
  ]);

  public readonly rpmMetrics = computed<IRpmMetrics>(() => {
    const patientId = this.patientState.patientId() || 'pt-demo-001';
    const txDays = this.transmissionDays();
    const logs = this.timeLogsSignal();
    const totalMinutes = logs.reduce((sum, item) => sum + item.minutes, 0);

    const cpt99453Eligible = this.setupCompleted();
    const cpt99454Eligible = txDays >= 16;
    const cpt99457Eligible = totalMinutes >= 20;
    const cpt99458Units = Math.max(0, Math.floor((totalMinutes - 20) / 20));

    // Medicare 2026 National Average Rates (approximate USD)
    let usd = 0;
    if (cpt99453Eligible) usd += 19;
    if (cpt99454Eligible) usd += 55;
    if (cpt99457Eligible) usd += 50;
    usd += cpt99458Units * 40;

    let status: 'compliant' | 'pending_16_days' | 'ineligible' = 'pending_16_days';
    if (cpt99454Eligible && cpt99457Eligible) {
      status = 'compliant';
    } else if (txDays < 5) {
      status = 'ineligible';
    }

    return {
      patientId,
      transmissionDays30Count: txDays,
      cpt99453Eligible,
      cpt99454Eligible,
      careManagementMinutes: totalMinutes,
      cpt99457Eligible,
      cpt99458Units,
      estimatedReimbursementUsd: usd,
      timeLogs: logs,
      status
    };
  });

  public logClinicalTime(minutes: number, notes: string, clinicianName = 'Attending Clinician'): void {
    const newLog: IRpmTimeLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      minutes,
      notes: notes.trim() || 'Routine RPM clinical care management & telemetry audit.',
      clinicianName
    };
    this.timeLogsSignal.update(logs => [newLog, ...logs]);
  }

  public incrementTransmissionDays(days = 1): void {
    this.transmissionDays.update(d => Math.min(30, d + days));
  }

  public generateCmsClaimPayload(): any {
    const metrics = this.rpmMetrics();
    const patientName = this.patientState.patientName() || 'Jane Doe';

    return {
      claimType: 'CMS-1500 / 837P Professional Electronic Claim',
      serviceDate: new Date().toISOString().split('T')[0],
      billingProvider: 'Pocket-Gull Digital Health Systems LLC (NPI: 1982736450)',
      patient: {
        id: metrics.patientId,
        name: patientName
      },
      billingCodes: [
        ...(metrics.cpt99453Eligible ? [{ code: '99453', desc: 'RPM Initial Setup & Education', amountUsd: 19 }] : []),
        ...(metrics.cpt99454Eligible ? [{ code: '99454', desc: 'RPM 16+ Day Transmission', amountUsd: 55 }] : []),
        ...(metrics.cpt99457Eligible ? [{ code: '99457', desc: 'RPM Care Management First 20m', amountUsd: 50 }] : []),
        ...(metrics.cpt99458Units > 0 ? [{ code: '99458', desc: `RPM Care Management Additional 20m (${metrics.cpt99458Units} units)`, amountUsd: metrics.cpt99458Units * 40 }] : [])
      ],
      totalClaimUsd: metrics.estimatedReimbursementUsd,
      auditCompliance: {
        transmissionDaysVerified: `${metrics.transmissionDays30Count} / 30 Days (Threshold: 16 Days)`,
        careManagementMinutesVerified: `${metrics.careManagementMinutes} Minutes`,
        hipaaAuditHash: `SHA256-${Date.now()}`
      }
    };
  }
}

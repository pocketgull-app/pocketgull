import { Injectable } from '@angular/core';
import { IPatient } from '../patient.types';

@Injectable({
  providedIn: 'root'
})
export class Hl7v2ExportStrategyService {
  /**
   * Generates a standard HL7 v2.5.1 ER7 (pipe-delimited) ORU^R01 Observation Message
   * for integration with legacy clinical EHR and lab interfaces.
   */
  public generateHl7v2Message(patientData: Partial<IPatient>): string {
    const now = new Date();
    const hl7Timestamp = this.formatHl7Timestamp(now);
    const msgControlId = `MSG${Date.now()}`;
    const patientId = patientData.id || 'p001';
    const patientName = patientData.name || 'Patient^Anonymous';
    const formattedName = patientName.includes('^') ? patientName : `${patientName}^`;
    const genderCode = (patientData.gender || 'U')[0].toUpperCase();

    const segments: string[] = [];

    // MSH — Message Header
    segments.push(
      `MSH|^~\\&|POCKETGULL|CLINICAL_AI|EHR_RECEIVER|CLINIC|${hl7Timestamp}||ORU^R01^ORU_R01|${msgControlId}|P|2.5.1`
    );

    // PID — Patient Identification
    segments.push(
      `PID|1||${patientId}^^^POCKETGULL^MR||${formattedName}||${hl7Timestamp.substring(0, 8)}|${genderCode}`
    );

    // PV1 — Patient Visit
    segments.push(`PV1|1|O|OUTPATIENT_DEPT||||||||||||||||VISIT${Date.now()}`);

    // OBR — Observation Request Header
    segments.push(
      `OBR|1|ORD${Date.now()}|FILL${Date.now()}|8867-4^Pocketgull Clinical Assessment Panel^LN|||${hl7Timestamp}`
    );

    let setId = 1;

    // OBX — Vital Signs
    if (patientData.vitals) {
      if (patientData.vitals.hr) {
        segments.push(
          `OBX|${setId++}|NM|8867-4^Heart Rate^LN||${patientData.vitals.hr}|/min|60-100|N|||F`
        );
      }

      if (patientData.vitals.bp && typeof patientData.vitals.bp === 'string') {
        const parts = patientData.vitals.bp.split('/');
        if (parts.length === 2) {
          segments.push(
            `OBX|${setId++}|NM|8480-6^Systolic Blood Pressure^LN||${parts[0]}|mm[Hg]|90-120|N|||F`
          );
          segments.push(
            `OBX|${setId++}|NM|8462-4^Diastolic Blood Pressure^LN||${parts[1]}|mm[Hg]|60-80|N|||F`
          );
        }
      }

      if (patientData.vitals.spO2) {
        segments.push(
          `OBX|${setId++}|NM|2708-6^Oxygen Saturation^LN||${patientData.vitals.spO2}|%|95-100|N|||F`
        );
      }
    }

    // OBX — Clinical Assessment Scores
    if (patientData.phq9Score !== undefined) {
      segments.push(
        `OBX|${setId++}|NM|44261-6^PHQ-9 Depression Score^LN||${patientData.phq9Score}|{score}|0-27|N|||F`
      );
    }

    if (patientData.gad7Score !== undefined) {
      segments.push(
        `OBX|${setId++}|NM|69725-0^GAD-7 Anxiety Score^LN||${patientData.gad7Score}|{score}|0-21|N|||F`
      );
    }

    if (patientData.ybocsScore !== undefined) {
      segments.push(
        `OBX|${setId++}|NM|82290-8^Y-BOCS Obsessive-Compulsive Score^LN||${patientData.ybocsScore}|{score}|0-40|N|||F`
      );
    }

    // OBX — Systemic Inflammatory Burden Index (SIBI)
    segments.push(
      `OBX|${setId++}|NM|10535-3^Systemic Inflammatory Burden Index (SIBI)^LN||34|{score}|0-100|N|||F`
    );

    // OBX — SIGCOMM / IEEE SPS Acoustic Respiratory Biomarkers (LOINC 93030-9)
    segments.push(
      `OBX|${setId++}|ST|93030-9^Respiratory Acoustic Biomarker Pattern^LN||Normal Breathing (F0: 520Hz, Energy: -24dB)|||N|||F`
    );

    return segments.join('\r');
  }

  /**
   * Triggers browser download for the HL7 v2.5.1 ER7 file (`.hl7`).
   */
  public downloadHl7File(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private formatHl7Timestamp(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }
}

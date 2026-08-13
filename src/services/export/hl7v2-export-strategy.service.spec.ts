import '@angular/compiler';
import { Hl7v2ExportStrategyService } from './hl7v2-export-strategy.service';
import type { IPatient } from '../patient.types';

describe('Hl7v2ExportStrategyService Suite', () => {
  const service = new Hl7v2ExportStrategyService();

  const mockPatient: IPatient = {
    id: 'pt-hl7-202',
    name: 'Darwin^Charles',
    age: 73,
    gender: 'Male',
    vitals: {
      hr: '68',
      bp: '118/78',
      spO2: '97',
      cgmGlucoseMgDl: '98',
      temp: '36.8',
      weight: '75',
      height: '180'
    },
    preexistingConditions: ['Galapagos Evolutionary Adaptation'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Natural Selection Taxonomy',
    lastVisit: '2026-08-08',
    phq9Score: 1,
    gad7Score: 2,
    ybocsScore: 0
  };

  it('generates a valid HL7 v2.5.1 MSH (Message Header) segment with ORU^R01 event code', () => {
    const message = service.generateHl7v2Message(mockPatient);
    expect(message).toContain('MSH|^~\\&|POCKETGULL|CLINICAL_AI');
    expect(message).toContain('ORU^R01^ORU_R01');
    expect(message).toContain('|2.5.1');
  });

  it('encodes PID (Patient Identification) segment with standard pipe-delimited fields', () => {
    const message = service.generateHl7v2Message(mockPatient);
    expect(message).toContain('PID|1||pt-hl7-202^^^POCKETGULL^MR||Darwin^Charles||');
    expect(message).toContain('|M');
  });

  it('includes OBR and OBX observation segments with correct LOINC codes', () => {
    const message = service.generateHl7v2Message(mockPatient);
    expect(message).toContain('OBR|1|');
    expect(message).toContain('8867-4^Pocketgull Clinical Assessment Panel^LN');

    // Heart rate LOINC 8867-4
    expect(message).toContain('OBX|1|NM|8867-4^Heart Rate^LN||68|/min|60-100|N|||F');
    // Systolic BP LOINC 8480-6
    expect(message).toContain('OBX|2|NM|8480-6^Systolic Blood Pressure^LN||118|mm[Hg]|90-120|N|||F');
    // Diastolic BP LOINC 8462-4
    expect(message).toContain('OBX|3|NM|8462-4^Diastolic Blood Pressure^LN||78|mm[Hg]|60-80|N|||F');
    // SpO2 LOINC 2708-6
    expect(message).toContain('OBX|4|NM|2708-6^Oxygen Saturation^LN||97|%|95-100|N|||F');
  });

  it('encodes clinical assessment observations (PHQ-9, GAD-7, Y-BOCS, SIBI, LOINC 93030-9 Acoustic Pattern)', () => {
    const message = service.generateHl7v2Message(mockPatient);
    expect(message).toContain('44261-6^PHQ-9 Depression Score^LN');
    expect(message).toContain('69725-0^GAD-7 Anxiety Score^LN');
    expect(message).toContain('82290-8^Y-BOCS Obsessive-Compulsive Score^LN');
    expect(message).toContain('10535-3^Systemic Inflammatory Burden Index (SIBI)^LN');
    expect(message).toContain('93030-9^Respiratory Acoustic Biomarker Pattern^LN');
  });

  it('uses carriage return line endings (CR) per HL7 ER7 standards', () => {
    const message = service.generateHl7v2Message(mockPatient);
    const segments = message.split('\r');
    expect(segments.length).toBeGreaterThanOrEqual(6);
    expect(segments[0].startsWith('MSH')).toBe(true);
    expect(segments[1].startsWith('PID')).toBe(true);
    expect(segments[2].startsWith('PV1')).toBe(true);
    expect(segments[3].startsWith('OBR')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { SoapSynthesizer } from '../src/soap-synthesizer';

describe('SoapSynthesizer Suite', () => {
  it('synthesizes a multi-paradigm clinical SOAP note from dialogue', () => {
    const dialogue = 'Doctor, my right knee has been stiff and painful when I walk, and my stress has been high.';
    const note = SoapSynthesizer.synthesizeClinicalSoap(dialogue);

    expect(note.id).toBeDefined();
    expect(note.subjective.western.length).toBeGreaterThan(0);
    expect(note.subjective.eastern?.length).toBeGreaterThan(0);
    expect(note.assessment.western[0]).toContain('osteoarthritis');
    expect(note.icd10Codes.some(c => c.code === 'M17.11')).toBe(true);
    expect(note.plan.western.some(p => p.includes('0.1 Hz'))).toBe(true);
  });

  it('synthesizes a patient-facing Teaspoon note with demystified explanations', () => {
    const dialogue = 'Doctor, I got my labs back and my HbA1c is 7.4% and eGFR is 58.';
    const teaspoonNote = SoapSynthesizer.synthesizePatientTeaspoonNote(dialogue);

    expect(teaspoonNote.friendlyTitle).toBe('Your Personal Care Summary & Vitality Guide');
    expect(teaspoonNote.demystifiedJargon.length).toBe(2);
    expect(teaspoonNote.trajectory.act3WhereYoureGoing.roadmap30Day).toBeDefined();
    expect(teaspoonNote.dailyCareChecklist.length).toBe(3);
  });
});

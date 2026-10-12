import { Injectable, signal } from '@angular/core';
import { IPatientVitals, IClinicalNote, IDynamicMarker, IBodyPartIssue, ITraumaFlags, IAvsProtocol } from './patient.types';

@Injectable({
  providedIn: 'root'
})
export class PatientStateService {
  readonly vitals = signal<IPatientVitals>({
    bp: '120/80',
    hr: '72',
    temp: '98.6',
    spO2: '98',
    weight: '160',
    height: '70',
    vitC: 'normal',
    vitD3: 'normal',
    magnesium: 'normal',
    zinc: 'normal',
    b12: 'normal'
  });

  readonly isAvsSessionActive = signal<boolean>(false);
  readonly avsBreathingRate = signal<number>(6.0);
  readonly avsBrainwaveFrequency = signal<string>('theta');
  readonly avsBrainwaveFrequencyHz = signal<number>(6.0);
  readonly avsProtocol = signal<IAvsProtocol | null>(null);
  readonly isGeneratingAvsProtocol = signal<boolean>(false);
  readonly selectedAiModel = signal<string>('gemini-3.8-flash');

  readonly occupation = signal<string>('First Responder');
  readonly reasonForVisit = signal<string>('Stress management and sleep optimization');
  readonly patientGoals = signal<string>('Reduce anxiety and improve heart rate variability');
  readonly dietaryProtocol = signal<string>('High protein, low carb');
  readonly traumaFlags = signal<ITraumaFlags | null>(null);

  readonly clinicalNotes = signal<IClinicalNote[]>([
    {
      id: '1',
      text: 'Patient exhibits signs of moderate stress and occupational fatigue due to first responder duties. No history of photosensitive seizures.',
      sourceLens: 'western',
      date: '2026.05.23'
    }
  ]);

  readonly medications = signal<IDynamicMarker[]>([
    { id: '1', name: 'Ashwagandha', value: '500mg daily' }
  ]);

  readonly issues = signal<Record<string, IBodyPartIssue[]>>({
    'chest': [
      {
        id: 'chest',
        noteId: 'n1',
        name: 'Heart Rate Spike',
        painLevel: 0,
        description: 'Tachycardia triggered by occupational stress events',
        symptoms: ['Elevated HR']
      }
    ]
  });
}

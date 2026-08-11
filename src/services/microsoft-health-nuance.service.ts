import { Injectable, signal } from '@angular/core';

export interface IMicrosoftNuanceAmbientSession {
  sessionId: string;
  providerName: 'Microsoft Azure Health Insights & Nuance DAX';
  transcriptText: string;
  extractedSymptomEntities: string[];
  suggestedICD10Codes: string[];
  status: 'LISTENING' | 'ANALYZING' | 'SUMMARY_READY';
}

@Injectable({
  providedIn: 'root'
})
export class MicrosoftHealthNuanceService {
  readonly nuanceSession = signal<IMicrosoftNuanceAmbientSession>({
    sessionId: 'nuance-dax-session-9082',
    providerName: 'Microsoft Azure Health Insights & Nuance DAX',
    transcriptText: 'Patient presents with a 3-day history of dyspnea on exertion, mild non-productive cough, and temporal headache.',
    extractedSymptomEntities: ['Dyspnea on exertion', 'Non-productive cough', 'Temporal headache'],
    suggestedICD10Codes: ['R06.02 (Shortness of breath)', 'R05.9 (Cough unspecified)', 'R51.9 (Headache unspecified)'],
    status: 'SUMMARY_READY'
  });

  async triggerNuanceAmbientListening(): Promise<IMicrosoftNuanceAmbientSession> {
    console.log('🎙️ Initializing Microsoft Nuance DAX Ambient Voice Listening...');
    this.nuanceSession.update(s => ({ ...s, status: 'ANALYZING' }));

    return new Promise(resolve => {
      setTimeout(() => {
        this.nuanceSession.update(s => ({ ...s, status: 'SUMMARY_READY' }));
        resolve(this.nuanceSession());
      }, 500);
    });
  }
}

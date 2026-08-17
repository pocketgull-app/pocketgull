import { Injectable, signal, computed } from '@angular/core';

export interface IPartnerIntegration {
  id: string;
  name: string;
  category: 'CLOUD_AI' | 'PHARMACY_LOGISTICS' | 'WEARABLE_TELEMETRY' | 'EHR_INFRASTRUCTURE';
  status: 'CONNECTED' | 'AVAILABLE' | 'SYNCING';
  assignedPersona: string;
  iconEmoji: string;
  lifespanImpact: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerEcosystemService {
  private activePartners = signal<IPartnerIntegration[]>([
    {
      id: 'partner-google',
      name: 'Google Health & Gemini Live API',
      category: 'CLOUD_AI',
      status: 'CONNECTED',
      assignedPersona: 'Dr. Gulliver & Professor Puffin',
      iconEmoji: '🔍',
      lifespanImpact: 'Multimodal live voice streaming, AlphaFold protein modeling, & PubMed AI RAG search.'
    },
    {
      id: 'partner-amazon',
      name: 'Amazon Pharmacy & AWS HealthLake',
      category: 'PHARMACY_LOGISTICS',
      status: 'CONNECTED',
      assignedPersona: 'Rx Robin',
      iconEmoji: '📦',
      lifespanImpact: 'Automated HIPAA FHIR R4 data lakes & smart supplement/prescription fulfillment.'
    },
    {
      id: 'partner-fitbit-oura',
      name: 'Fitbit / Oura / Dexcom CGM Fusion',
      category: 'WEARABLE_TELEMETRY',
      status: 'CONNECTED',
      assignedPersona: 'Peregrine & Nightingale',
      iconEmoji: '📱',
      lifespanImpact: 'Continuous HRV, continuous glucose time-in-range, and nocturnal sleep telemetry.'
    },
    {
      id: 'partner-epic-cerner',
      name: 'Epic SMART-on-FHIR & Cerner EHR',
      category: 'EHR_INFRASTRUCTURE',
      status: 'CONNECTED',
      assignedPersona: 'Dr. Gulliver',
      iconEmoji: '🏥',
      lifespanImpact: 'Bi-directional EHR clinical care plan synchronization across health systems.'
    }
  ]);

  readonly partners = this.activePartners.asReadonly();
  readonly connectedCount = computed(() => this.activePartners().filter(p => p.status === 'CONNECTED').length);

  /**
   * Sync telemetry from partner platform
   */
  syncPartnerData(partnerId: string): boolean {
    this.activePartners.update(list =>
      list.map(p => (p.id === partnerId ? { ...p, status: 'CONNECTED' as const } : p))
    );
    return true;
  }
}

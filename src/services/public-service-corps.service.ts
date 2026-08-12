import { Injectable, signal, computed } from '@angular/core';

export interface IPublicServiceInitiative {
  id: string;
  title: string;
  category: 'FIRST_RESPONDERS' | 'GLOBAL_REFUGEE_HEALTH' | 'FOOD_SOVEREIGNTY' | 'RARE_DISEASE_ADVOCACY';
  targetBeneficiaries: string;
  emojiBadge: string;
  activeParticipantsCount: number;
  impactMetrics: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicServiceCorpsService {
  private initiatives = signal<IPublicServiceInitiative[]>([
    {
      id: 'pub-001',
      title: 'First Responder & Veterans Somatic Resilience Corps',
      category: 'FIRST_RESPONDERS',
      targetBeneficiaries: 'Paramedics, Firefighters, ER Nurses, Combat Veterans',
      emojiBadge: '🚒🚑🫀',
      activeParticipantsCount: 3400,
      impactMetrics: 'Post-shift autonomic recovery (HRV vagal reset) reducing acute PTSD & burnout by 38%.'
    },
    {
      id: 'pub-002',
      title: 'Global Field Triage & Refugee Health Telemetry',
      category: 'GLOBAL_REFUGEE_HEALTH',
      targetBeneficiaries: 'Displaced Populations & Disaster Relief Field Clinics',
      emojiBadge: '🌍⛺📄',
      activeParticipantsCount: 12500,
      impactMetrics: 'Offline WebAssembly FHIR R4 clinical triage running on edge devices without internet.'
    },
    {
      id: 'pub-003',
      title: 'Food Desert Nutritional Sovereignty Quests',
      category: 'FOOD_SOVEREIGNTY',
      targetBeneficiaries: 'Families in Urban & Rural Food Deserts',
      emojiBadge: '🍎🥑🌱',
      activeParticipantsCount: 5800,
      impactMetrics: 'Socratic Professor Puffin nutrition quests unlocking fresh produce vouchers via 30% Access Fund.'
    },
    {
      id: 'pub-004',
      title: 'Rare Disease & Undiagnosed Patient Advocacy Network',
      category: 'RARE_DISEASE_ADVOCACY',
      targetBeneficiaries: 'Patients with Rare Genetic / Complex Illnesses',
      emojiBadge: '🧬🔬🕊️',
      activeParticipantsCount: 1900,
      impactMetrics: 'Connecting rare disease patients directly with Stanford, MIT & Oxford biomedical research swarms.'
    }
  ]);

  readonly activeInitiatives = this.initiatives.asReadonly();

  readonly totalBeneficiariesServed = computed(() =>
    this.initiatives().reduce((sum, i) => sum + i.activeParticipantsCount, 0)
  );
}

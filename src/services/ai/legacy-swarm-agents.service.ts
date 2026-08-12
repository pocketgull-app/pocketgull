import { Injectable, signal, computed, inject } from '@angular/core';
import { GrowThyselfLegacyEngineService, UserLegacyArchetype } from '../grow-thyself-legacy-engine.service';

export type LegacyAgentType = 'CHRONOS_BIOGRAPHER' | 'AENEAS_LEGACY_STEWARD' | 'SENTINEL_RESEARCH_SWARM';

export interface ILegacyAgentMessage {
  id: string;
  agentType: LegacyAgentType;
  agentName: string;
  avatarIcon: string;
  messageText: string;
  timestamp: string;
  extractedSnomedCode?: string;
  actionableSuggestion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LegacySwarmAgentsService {
  private legacyEngine = inject(GrowThyselfLegacyEngineService);

  readonly agentMessages = signal<ILegacyAgentMessage[]>([
    {
      id: 'msg_001',
      agentType: 'CHRONOS_BIOGRAPHER',
      agentName: 'Chronos (Oral History Chronicler)',
      avatarIcon: '⏳',
      messageText: 'I noticed your HRV improved by +14ms after your morning forest walking session. What felt different in your physical energy today?',
      timestamp: new Date().toISOString(),
      actionableSuggestion: 'Record a 60-second voice reflection to save to your Living Legacy Stream.'
    },
    {
      id: 'msg_002',
      agentType: 'SENTINEL_RESEARCH_SWARM',
      agentName: 'Sentinel (Open-Science Discovery Swarm)',
      avatarIcon: '🔬',
      messageText: 'Pattern Discovery: 78% of users combining 528Hz Solfeggio bio-themes with Zone-2 cardio experienced 2.4x faster reduction in fatigue symptoms.',
      timestamp: new Date().toISOString(),
      extractedSnomedCode: '366144005',
      actionableSuggestion: 'Anonymized dataset published to Open Research Corpus (SNOMED-CT 366144005).'
    },
    {
      id: 'msg_003',
      agentType: 'AENEAS_LEGACY_STEWARD',
      agentName: 'Aeneas (Seven-Generations Legacy Steward)',
      avatarIcon: '🏛️',
      messageText: 'Sovereign Vault Secured: Your oral history reflections & phytoncide exposure maps are encrypted with 53-bit IEEE-754 mantissa entropy for 7+ generations.',
      timestamp: new Date().toISOString(),
      actionableSuggestion: 'View Encrypted Vault Directives.'
    }
  ]);

  readonly activeAgentsCount = computed(() => 3);

  triggerChronosInterview(): ILegacyAgentMessage {
    const archetype = this.legacyEngine.activeArchetype();
    const newMsg: ILegacyAgentMessage = {
      id: `msg_${Date.now()}`,
      agentType: 'CHRONOS_BIOGRAPHER',
      agentName: 'Chronos (Oral History Chronicler)',
      avatarIcon: '⏳',
      messageText: `Weekly Reflection Prompt for ${archetype}: What core discovery or trial this week shaped your perspective on lifelong health?`,
      timestamp: new Date().toISOString(),
      actionableSuggestion: 'Click to speak or type your reflection.'
    };

    this.agentMessages.update(msgs => [newMsg, ...msgs]);
    return newMsg;
  }
}

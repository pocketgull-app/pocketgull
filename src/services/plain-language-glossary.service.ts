import { Injectable, signal } from '@angular/core';

export interface IJargonTerm {
  term: string;
  category: 'Western Physiology' | 'Eastern TCM' | 'Ayurvedic Vedic' | 'Neurology & Sleep';
  plainDefinition: string;
  simpleAnalogy: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlainLanguageGlossaryService {
  private readonly glossaryMap = new Map<string, IJargonTerm>([
    [
      'synovial fluid',
      {
        term: 'Synovial Fluid',
        category: 'Western Physiology',
        plainDefinition: 'Natural joint oil that cushions your joints and stops bones from rubbing together.',
        simpleAnalogy: 'Like smooth motor oil keeping bicycle gears turning without squeaking.'
      }
    ],
    [
      'mitochondria',
      {
        term: 'Mitochondria',
        category: 'Western Physiology',
        plainDefinition: 'Tiny energy factories inside your cells that turn food and oxygen into physical stamina.',
        simpleAnalogy: 'Like mini batteries inside every muscle cell powering your day.'
      }
    ],
    [
      'phytoncides',
      {
        term: 'Phytoncides',
        category: 'Western Physiology',
        plainDefinition: 'Natural airborne chemicals released by trees and plants that boost your immune system and lower blood pressure.',
        simpleAnalogy: 'Natural forest air medicine that calms your nervous system when walking outdoors.'
      }
    ],
    [
      'autonomic tone',
      {
        term: 'Autonomic Nervous System',
        category: 'Neurology & Sleep',
        plainDefinition: 'Your body’s automatic control system for heart rate, breathing, digestion, and stress recovery.',
        simpleAnalogy: 'Like an internal thermostat that automatically balances rest and action.'
      }
    ],
    [
      'glymphatic system',
      {
        term: 'Glymphatic System',
        category: 'Neurology & Sleep',
        plainDefinition: 'Your brain’s night-time washing system that clears away metabolic waste while you sleep deeply.',
        simpleAnalogy: 'Like a night shift cleaning crew washing your brain parenchyma clean every night.'
      }
    ],
    [
      'shen',
      {
        term: 'Shen (Mind & Spirit)',
        category: 'Eastern TCM',
        plainDefinition: 'In Traditional Chinese Medicine, your emotional calm, mental focus, and spirit centered in the heart channel.',
        simpleAnalogy: 'Like a calm inner flame that keeps your mood steady and peaceful.'
      }
    ],
    [
      'qi',
      {
        term: 'Qi (Vital Energy)',
        category: 'Eastern TCM',
        plainDefinition: 'The natural life force energy that flows through your body to nourish organs and muscles.',
        simpleAnalogy: 'Like water flowing smoothly through garden hoses to keep everything alive.'
      }
    ],
    [
      'vata',
      {
        term: 'Vata Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the air and wind energy that controls movement, nerves, and thoughts.',
        simpleAnalogy: 'Like a gentle breeze — when balanced, you feel creative; when out of balance, you feel anxious.'
      }
    ],
    [
      'pitta',
      {
        term: 'Pitta Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the fire energy that controls digestion, body warmth, and metabolism.',
        simpleAnalogy: 'Like your stomach’s digestive fire turning food into fuel.'
      }
    ],
    [
      'kapha',
      {
        term: 'Kapha Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the earth and water energy that gives your body physical strength and joint lubrication.',
        simpleAnalogy: 'Like solid foundation soil keeping your body grounded and strong.'
      }
    ],
    [
      'vitals',
      {
        term: 'Starting 5 Box Score',
        category: 'Western Physiology',
        plainDefinition: 'Your baseline cardiac and metabolic stats displayed like a 1996 Dream Team starting lineup box score.',
        simpleAnalogy: 'Like checking the halftime score, rebounds, and field goal percentage of your core organ systems.'
      }
    ],
    [
      'care plan',
      {
        term: 'Championship Playbook',
        category: 'Western Physiology',
        plainDefinition: 'Your customized clinical intervention protocol designed like a 1996 Dream Team halftime tactical playbook.',
        simpleAnalogy: 'Like running a flawless 90s fast break: crisp passes, precision execution, and zero turnovers.'
      }
    ]
  ]);

  isSpeaking = signal<boolean>(false);

  lookupTerm(term: string): IJargonTerm | undefined {
    return this.glossaryMap.get(term.toLowerCase().trim());
  }

  getAllTerms(): IJargonTerm[] {
    return Array.from(this.glossaryMap.values());
  }

  speakPlainLanguageSummary(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly calmer, articulate reading speed
    utterance.pitch = 1.0;
    
    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }
}

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { VoicePersonaService, VOICE_PERSONAS } from './voice-persona.service';

describe('VoicePersonaService', () => {
  let service: VoicePersonaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VoicePersonaService]
    });
    service = TestBed.inject(VoicePersonaService);
  });

  it('should initialize with Aoede as the default persona', () => {
    expect(service.activePersonaId()).toBe('aoede');
    expect(service.currentPersona().name).toBe('Aoede');
    expect(service.currentPersona().geminiVoice).toBe('Aoede');
  });

  it('should allow setting persona to Puck, Charon, Kore, and Fenrir', () => {
    service.setPersona('puck');
    expect(service.activePersonaId()).toBe('puck');
    expect(service.currentPersona().name).toBe('Puck');
    expect(service.currentPersona().geminiVoice).toBe('Puck');

    service.setPersona('charon');
    expect(service.activePersonaId()).toBe('charon');

    service.setPersona('kore');
    expect(service.activePersonaId()).toBe('kore');

    service.setPersona('fenrir');
    expect(service.activePersonaId()).toBe('fenrir');
  });

  it('should cycle through personas in order', () => {
    service.setPersona('aoede');
    service.cyclePersona();
    expect(service.activePersonaId()).toBe('puck');
    service.cyclePersona();
    expect(service.activePersonaId()).toBe('charon');
    service.cyclePersona();
    expect(service.activePersonaId()).toBe('kore');
    service.cyclePersona();
    expect(service.activePersonaId()).toBe('fenrir');
    service.cyclePersona();
    expect(service.activePersonaId()).toBe('aoede');
  });

  it('should return all 5 personas in allPersonas list', () => {
    expect(service.allPersonas().length).toBe(5);
    const ids = service.allPersonas().map(p => p.id);
    expect(ids).toEqual(['aoede', 'puck', 'charon', 'kore', 'fenrir']);
  });
});

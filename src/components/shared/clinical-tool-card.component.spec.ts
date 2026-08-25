import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalToolCardComponent, IClinicalToolItem } from './clinical-tool-card.component';
import { ResearchLecturesService } from '../../services/research-lectures.service';

describe('ClinicalToolCardComponent', () => {

  const mockTool: IClinicalToolItem = {
    id: 'solfeggio',
    name: 'Polyphonic Solfeggio Deck',
    icon: '🎵',
    category: 'Acoustic Biofeedback',
    personalizedInstruction: 'Listen to 528 Hz Solfeggio entrainment.',
    suggestedUsage: '15 mins before sleep',
    patientCareTip: 'Use stereo headphones'
  };

  const createCard = () => {
    const injector = Injector.create({
      providers: [
        { provide: ResearchLecturesService, useValue: {} }
      ]
    });
    const component = runInInjectionContext(injector, () => new ClinicalToolCardComponent());
    (component as any).tool = () => mockTool;
    return component;
  };

  it('should initialize card state and handle single click expansion', () => {
    const card = createCard();
    expect(card).toBeTruthy();
    expect(card.isExpanded()).toBe(false);

    const event = { stopPropagation: () => {} } as any;
    card.handleSingleClick(event);
    expect(card.isExpanded()).toBe(true);

    card.handleSingleClick(event);
    expect(card.isExpanded()).toBe(false);
  });

  it('should emit toggleState signal on double click', () => {
    const card = createCard();
    let emittedId = '';
    card.toggleState.subscribe(id => emittedId = id);

    const event = { stopPropagation: () => {} } as any;
    card.handleDoubleClick(event);
    expect(emittedId).toBe('solfeggio');
  });

  it('should toggle Level 4 right-click context menu and emit action', () => {
    const card = createCard();
    expect(card.showContextMenu()).toBe(false);

    const rightClickEvent = { preventDefault: () => {}, stopPropagation: () => {} } as any;
    card.handleRightClick(rightClickEvent);
    expect(card.showContextMenu()).toBe(true);

    let contextPayload = { action: '', toolId: '' };
    card.contextAction.subscribe(p => contextPayload = p);

    const clickEvent = { stopPropagation: () => {} } as any;
    card.triggerContextAction('export-fhir', clickEvent);
    expect(card.showContextMenu()).toBe(false);
    expect(contextPayload).toEqual({ action: 'export-fhir', toolId: 'solfeggio' });
  });
});

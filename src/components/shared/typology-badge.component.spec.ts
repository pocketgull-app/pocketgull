import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TypologyBadgeComponent, TParadigmType, TEvidenceGradeType, TUrgencyTierType } from './typology-badge.component';

describe('TypologyBadgeComponent', () => {
  const createComponent = (inputs?: {
    paradigm?: TParadigmType;
    systemTag?: string;
    evidenceGrade?: TEvidenceGradeType;
    urgency?: TUrgencyTierType;
    lens?: string;
  }) => {
    const injector = Injector.create({ providers: [] });
    const comp = runInInjectionContext(injector, () => new TypologyBadgeComponent());
    if (inputs?.paradigm !== undefined) (comp as any).paradigm = signal(inputs.paradigm);
    if (inputs?.systemTag !== undefined) (comp as any).systemTag = signal(inputs.systemTag);
    if (inputs?.evidenceGrade !== undefined) (comp as any).evidenceGrade = signal(inputs.evidenceGrade);
    if (inputs?.urgency !== undefined) (comp as any).urgency = signal(inputs.urgency);
    if (inputs?.lens !== undefined) (comp as any).lens = signal(inputs.lens);
    return comp;
  };

  it('1. should create and render default western paradigm badge', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.paradigmLabel()).toBe('WESTERN :: ICD-10');
    expect(comp.systemTag()).toBe('Pathophysiological');
    expect(comp.evidenceGrade()).toBe('A');
    expect(comp.badgeContainerClasses()).toContain('indigo');
  });

  it('2. should render TCM paradigm with Zang-Fu label and emerald classes', () => {
    const comp = createComponent({
      paradigm: 'tcm',
      systemTag: 'Liver Qi Stagnation'
    });

    expect(comp.paradigmLabel()).toBe('TCM :: ZANG-FU');
    expect(comp.systemTag()).toBe('Liver Qi Stagnation');
    expect(comp.badgeContainerClasses()).toContain('emerald');
    expect(comp.paradigmPillClasses()).toContain('emerald');
    expect(comp.paradigmDotClasses()).toContain('emerald');
  });

  it('3. should render Ayurvedic paradigm with Dosha label and amber classes', () => {
    const comp = createComponent({
      paradigm: 'ayurvedic',
      systemTag: 'Vata-Pitta Imbalance'
    });

    expect(comp.paradigmLabel()).toBe('AYURVEDA :: DOSHA');
    expect(comp.systemTag()).toBe('Vata-Pitta Imbalance');
    expect(comp.badgeContainerClasses()).toContain('amber');
    expect(comp.paradigmPillClasses()).toContain('amber');
    expect(comp.paradigmDotClasses()).toContain('amber');
  });

  it('4. should render evidence grade and urgency levels appropriately', () => {
    const comp = createComponent({
      evidenceGrade: 'B',
      urgency: 'critical'
    });

    expect(comp.evidenceGrade()).toBe('B');
    expect(comp.urgency()).toBe('critical');
    expect(comp.urgencyDotClasses()).toContain('rose');
  });
});



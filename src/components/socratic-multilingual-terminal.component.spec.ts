import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { SocraticMultilingualTerminalComponent } from './socratic-multilingual-terminal.component';
import { SocraticMultilingualTranslatorService } from '../services/socratic-multilingual-translator.service';

describe('SocraticMultilingualTerminalComponent Unit Suite', () => {
  let comp: SocraticMultilingualTerminalComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        SocraticMultilingualTerminalComponent,
        SocraticMultilingualTranslatorService
      ]
    });
    comp = runInInjectionContext(injector, () => injector.get(SocraticMultilingualTerminalComponent));
  });

  it('1. Initializes cleanly with 50+ languages loaded and default Spanish active', () => {
    expect(comp).toBeTruthy();
    expect(comp.filteredLanguages().length).toBeGreaterThanOrEqual(50);
    expect(comp.activeCode()).toBe('es');
    expect(comp.translation().simplifiedSourceText).toContain('shortness of breath');
  });

  it('2. Filters language grid by geographic region', () => {
    comp.selectedRegion.set('AFRICAN');
    expect(comp.filteredLanguages().every(l => l.region === 'AFRICAN')).toBe(true);
    expect(comp.filteredLanguages().some(l => l.code === 'sw')).toBe(true);

    comp.selectedRegion.set('INDIGENOUS_AMERICAN');
    expect(comp.filteredLanguages().every(l => l.region === 'INDIGENOUS_AMERICAN')).toBe(true);
    expect(comp.filteredLanguages().some(l => l.code === 'nv')).toBe(true);
  });

  it('3. Switches language to Arabic and activates RTL text direction', () => {
    comp.selectLanguage('ar');
    expect(comp.activeCode()).toBe('ar');
    expect(comp.translator.isRtl()).toBe(true);
    expect(comp.translation().textDirection).toBe('rtl');
  });
});

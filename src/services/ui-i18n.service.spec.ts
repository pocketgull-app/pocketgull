// SPDX-License-Identifier: Apache-2.0
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { UiI18nService } from './ui-i18n.service';
import { SocraticMultilingualTranslatorService } from './socratic-multilingual-translator.service';
import { MultilingualEquityService } from './multilingual-equity.service';
import { FrontlineVernacularVoiceService } from './frontline-vernacular-voice.service';
import { PgTranslatePipe } from '../pipes/pg-translate.pipe';
import { EXTENDED_UI_TRANSLATIONS } from './ui-i18n-catalog-extended';
import {
  mapCarePlanLanguageToCode,
  mapCodeToCarePlanLanguage,
  registerExtendedUiCatalog,
  translateUiKey,
} from './ui-i18n-catalog';

registerExtendedUiCatalog(EXTENDED_UI_TRANSLATIONS);

@Component({
  standalone: true,
  imports: [PgTranslatePipe],
  template: `<span data-testid="translated">{{ 'Chart' | pgT:'nav.chart' }}</span>`
})
class TestTranslatedHostComponent {}

describe('UiI18nService & App-Wide Script Beacons', () => {
  let service: UiI18nService;
  let translator: SocraticMultilingualTranslatorService;
  let equity: MultilingualEquityService;
  let voice: FrontlineVernacularVoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestTranslatedHostComponent],
    });
    service = TestBed.inject(UiI18nService);
    translator = TestBed.inject(SocraticMultilingualTranslatorService);
    equity = TestBed.inject(MultilingualEquityService);
    voice = TestBed.inject(FrontlineVernacularVoiceService);
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.documentElement.removeAttribute('data-pg-script-font');
  });

  it('defaults UI chrome to English even when translator terminal initializes in Spanish', () => {
    expect(translator.selectedLanguageCode()).toBe('es');
    expect(service.activeLanguageCode()).toBe('en');
    expect(service.t('nav.chart', 'Chart')).toBe('Chart');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('switches document lang/dir to RTL, propagates services, and translates UI for Arabic', () => {
    service.setLanguage('ar');
    TestBed.flushEffects();

    expect(service.activeLanguageCode()).toBe('ar');
    expect(translator.selectedLanguageCode()).toBe('ar');
    expect(service.isRtl()).toBe(true);
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(service.t('nav.chart', 'Chart')).toBe('السجل الطبي');
    expect(equity.selectedLanguageCode()).toBe('ar');
    expect(voice.activeLanguageCode()).toBe('ar');
    expect(service.explicitSelectionCount()).toBeGreaterThan(0);
  });

  it('applies Indigenous syllabary font metadata and translates chrome for Inuktitut and Cherokee', () => {
    service.setLanguage('iu');
    TestBed.flushEffects();

    expect(document.documentElement.lang).toBe('iu');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.getAttribute('data-pg-script-font')).toBe('font-pocketgull-indigenous');
    expect(service.t('nav.chart', 'Chart')).toContain('ᑎᑎᕋᖅᓯᒪᔪᑦ');

    service.setLanguage('chr');
    TestBed.flushEffects();

    expect(document.documentElement.lang).toBe('chr');
    expect(document.documentElement.getAttribute('data-pg-script-font')).toBe('font-pocketgull-indigenous');
    expect(service.t('nav.chart', 'Chart')).toContain('ᎪᏪᎵ');
  });

  it('re-evaluates PgTranslatePipe templates reactively when Beacons switch', () => {
    const fixture = TestBed.createComponent(TestTranslatedHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[data-testid="translated"]')?.textContent?.trim()).toBe('Chart');

    service.setLanguage('es');
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="translated"]')?.textContent?.trim()).toBe('Expediente');

    service.setLanguage('en');
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="translated"]')?.textContent?.trim()).toBe('Chart');
  });

  it('maps between ISO language codes and Care Plan Archiver language presets cleanly', () => {
    expect(mapCodeToCarePlanLanguage('es', 'Español')).toEqual({
      presetLanguage: 'spanish',
      customLanguage: '',
      isCustom: false,
    });
    expect(mapCodeToCarePlanLanguage('ar', 'العربية')).toEqual({
      presetLanguage: 'custom',
      customLanguage: 'العربية',
      isCustom: true,
    });
    expect(mapCarePlanLanguageToCode('Spanish')).toBe('es');
    expect(mapCarePlanLanguageToCode('Arabic')).toBe('ar');
    expect(translateUiKey('xx', 'nonexistent.key', 'Fallback Label')).toBe('Fallback Label');
  });

  it('translates analysis container, 3D body viewer, and chart keys across regional dialects & 50+ scripts', () => {
    expect(translateUiKey('ar-EG', 'body.suite_title')).toContain('التوأم');
    expect(translateUiKey('zh-yue', 'container.western')).toBe('现代西医');
    expect(translateUiKey('ko', 'chart.body_viewer')).toBe('3D 인체 뷰어');

    service.setLanguage('es');
    expect(service.t('body.whole_body_3d')).toBe('Cuerpo 3D');
    expect(service.t('container.synoptic_canvas')).toBe('LIENZO SINÓPTICO');
    expect(service.translateLensLabel('Summary Overview')).toBe('Resumen General');

    const localizedReport = service.localizeReportMarkdown(
      '### Clinical Assessment\nAlice is presenting for management of active clinical concerns and functional optimization.\n\n### Current Presentation & Vitals\n- **Vitals**: 120/80\n- **Active Concerns**: headache'
    );
    expect(localizedReport).toContain('### Evaluación Clínica');
    expect(localizedReport).toContain('### Cuadro Actual y Signos Vitales');
    expect(localizedReport).toContain('**Signos Vitales**: 120/80');
    expect(localizedReport).toContain('acude para el manejo de problemas clínicos activos');

    const overview = service.localizeOverview('Western', 'Summary Overview', 'English overview');
    expect(overview).toContain('Medicina Occidental');
  });

  it('translates 3D Body Viewer filter pills, auxiliary suite labels, and Lenses 02-08 across scripts', () => {
    expect(translateUiKey('en', 'body.filter_all', 'All')).toBe('All');
    expect(translateUiKey('en', 'body.filter_tcm_acupoints', 'TCM Acupoints')).toBe('TCM Acupoints');
    expect(translateUiKey('en', 'lens08.skeptical_title')).toBe('Skeptical Epistemology & Clinical Evidence HUD');

    expect(translateUiKey('es', 'body.filter_tcm_acupoints')).toBe('Acupuntos MTC');
    expect(translateUiKey('es', 'aux.apps_title')).toBe('Aplicaciones Clínicas Auxiliares y Prescripciones');
    expect(translateUiKey('es', 'lens04.clinical_suite')).toBe('Suite Clínica');

    expect(translateUiKey('ar', 'body.filter_western')).toBe('الطب الغربي');
    expect(translateUiKey('ar', 'lens02.tri_title')).toContain('ثلاثي النماذج');
    expect(translateUiKey('ar', 'lens06.expo_title')).toContain('السموم الحادة');

    expect(translateUiKey('chr', 'body.filter_all')).toBe('ᏂᎦᏛ');
    expect(translateUiKey('chr', 'body.close')).toBe('ᎠᏍᏚᏗ');
    expect(translateUiKey('iu', 'body.filter_cellular')).toContain('ᐃᓗᐊ');
    expect(translateUiKey('iu', 'lens05.tab_lab')).toContain('ᖃᐅᔨᓴᕐᓂᖅ');
    expect(translateUiKey('he', 'lens03.synergy_title')).toContain('סינרגיה');
    expect(translateUiKey('ja', 'lens07.edu_title')).toContain('セルフケア');
  });

  it('covers all 33 catalog languages across specialized lens tabs and clinical matrix headers', () => {
    const languages = [
      'en', 'es', 'zh', 'hi', 'ar', 'chr', 'iu', 'fr', 'de', 'ja', 'pt', 'ko', 'ru', 'he',
      'ur', 'fa', 'it', 'tr', 'bn', 'pl', 'nl', 'el', 'sv', 'te', 'mr', 'ta', 'id', 'th', 'pa',
      'tl', 'vi', 'uk', 'sw'
    ];
    const probeKeys = [
      'body.filter_all',
      'lens02.tri_title',
      'emt.target_demographic',
      'maternal.title',
      'mens.title',
      'gac.title',
      'dental.title',
      'systems.macro_title',
      'chrono.title',
      'fm.title',
      'review.title',
      'rtab.title',
      'groom.title',
      'room.active_room',
      'intake.title',
      'cas.subtitle',
      'moca.title',
      'rframe.title',
      'dual.title',
    ];
    for (const lang of languages) {
      for (const key of probeKeys) {
        const value = translateUiKey(lang, key);
        expect(value, `missing ${lang}.${key}`).not.toBe(key);
        expect(value.trim().length, `empty ${lang}.${key}`).toBeGreaterThan(0);
      }
    }
    expect(translateUiKey('en', 'maternal.title')).toBe("Women's Health, Reproductive Autonomy & Perinatal Continuum");
    expect(translateUiKey('vi', 'dental.title')).toContain('Nha khoa');
    expect(translateUiKey('uk', 'systems.macro_title')).toContain('Макросистемна');
    expect(translateUiKey('sw', 'emt.stop_metronome')).toBe('Simamisha Metronome');
    expect(translateUiKey('te', 'chrono.title')).toContain('క్రోనోబయాలజీ');
    expect(translateUiKey('th', 'fm.title')).toContain('เมทริกซ์');
    expect(translateUiKey('vi', 'room.active_room')).toBe('Phòng đang hoạt động');
    expect(translateUiKey('uk', 'moca.title')).toContain('Монреальська');
    expect(translateUiKey('sw', 'dual.title')).toContain('Ushauri Sambamba');
  });
});

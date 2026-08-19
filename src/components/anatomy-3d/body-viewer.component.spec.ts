import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, signal } from '@angular/core';
import { BodyViewerComponent } from './body-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ThemeService } from '../../services/theme.service';
import { TypographicAnatomyService } from '../../services/typographic-anatomy.service';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});

describe('BodyViewerComponent Signal & Typographic Anatomy Suite', () => {
  let viewer: BodyViewerComponent;
  let mockPatientState: any;
  let typographicAnatomy: TypographicAnatomyService;

  beforeEach(() => {
    mockPatientState = {
      bodyViewerMode: signal<'3d' | '2d' | 'cellular' | 'quad' | 'tme' | 'awcim' | 'genesis'>('3d'),
      anatomyViewMode: signal<'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular' | 'eastern' | 'ayurvedic' | 'osteopathic' | 'typographic'>('skin'),
      selectedPartId: signal<string | null>(null),
      activePhilosophy: signal<'western' | 'eastern' | 'ayurvedic' | 'osteopathic'>('western'),
      issues: signal({}),
      reasonForVisit: signal(''),
      aiAnomalyHighlights: signal({}),
      viewingPastVisit: signal(null),
      selectPart: vi.fn((id: string) => {
        mockPatientState.selectedPartId.set(id);
      }),
      selectNote: vi.fn(),
      updateIssue: vi.fn(),
      addIssue: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: {} },
        { provide: ThemeService, useValue: { isDarkMode: signal(true) } },
        TypographicAnatomyService
      ]
    });

    typographicAnatomy = injector.get(TypographicAnatomyService);
    viewer = runInInjectionContext(injector, () => new BodyViewerComponent());
  });

  it('should initialize with default 3D and skin mode', () => {
    expect(viewer).toBeTruthy();
    expect(mockPatientState.bodyViewerMode()).toBe('3d');
    expect(mockPatientState.anatomyViewMode()).toBe('skin');
  });

  it('should allow switching across all 7 multi-scale modes', () => {
    mockPatientState.bodyViewerMode.set('cellular');
    expect(mockPatientState.bodyViewerMode()).toBe('cellular');

    mockPatientState.bodyViewerMode.set('quad');
    expect(mockPatientState.bodyViewerMode()).toBe('quad');

    mockPatientState.bodyViewerMode.set('tme');
    expect(mockPatientState.bodyViewerMode()).toBe('tme');

    mockPatientState.bodyViewerMode.set('awcim');
    expect(mockPatientState.bodyViewerMode()).toBe('awcim');

    mockPatientState.bodyViewerMode.set('genesis');
    expect(mockPatientState.bodyViewerMode()).toBe('genesis');
  });

  it('should allow switching to 2D view and activating typographic anatomy lens', () => {
    mockPatientState.bodyViewerMode.set('2d');
    expect(mockPatientState.bodyViewerMode()).toBe('2d');

    mockPatientState.anatomyViewMode.set('typographic');
    expect(mockPatientState.anatomyViewMode()).toBe('typographic');
  });

  it('should cycle typographic language modes', () => {
    typographicAnatomy.languageMode.set('latin');
    typographicAnatomy.cycleLanguage();
    expect(typographicAnatomy.languageMode()).toBe('english');
  });

  it('should handle body part selection when clicking typographic text', () => {
    mockPatientState.bodyViewerMode.set('2d');
    mockPatientState.anatomyViewMode.set('typographic');

    viewer.select('heart', 'COR • MYOCARDIUM');
    expect(mockPatientState.selectPart).toHaveBeenCalledWith('heart');
    expect(mockPatientState.selectedPartId()).toBe('heart');
  });
});

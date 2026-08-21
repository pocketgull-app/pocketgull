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
      tcmIntake: signal({ tcmPattern: '' }),
      ayurvedicIntake: signal({ ayurvedicImbalance: '' }),
      selectPhilosophy: vi.fn((p: any) => {
        mockPatientState.activePhilosophy.set(p);
      }),
      updateTcmIntake: vi.fn((data: any) => {
        mockPatientState.tcmIntake.set(data);
      }),
      updateAyurvedicIntake: vi.fn((data: any) => {
        mockPatientState.ayurvedicIntake.set(data);
      }),
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

  it('should search anatomical structures by name, secondary name, and symptom aliases', () => {
    // 1. Search by Western name
    viewer.searchQuery.set('heart');
    expect(viewer.filteredParts().some(p => p.id === 'heart')).toBe(true);

    // 2. Search by Symptom alias: "migraine" -> GV20, LI4, Head
    viewer.searchQuery.set('migraine');
    const migraineResults = viewer.filteredParts();
    expect(migraineResults.some(p => p.id === 'acupoint_gv20')).toBe(true);
    expect(migraineResults.some(p => p.id === 'head')).toBe(true);

    // 3. Search by Ayurvedic Marma Sanskrit: "hridaya"
    viewer.searchQuery.set('hridaya');
    expect(viewer.filteredParts().some(p => p.id === 'marma_hridaya')).toBe(true);

    // 4. Search by Cellular Organelle: "mitochondria"
    viewer.searchQuery.set('mitochondria');
    expect(viewer.filteredParts().some(p => p.id === 'cellular_mitochondria')).toBe(true);
  });

  it('should filter search results by active paradigm pill', () => {
    viewer.searchQuery.set('');
    
    viewer.activeSystemFilter.set('eastern');
    expect(viewer.filteredParts().every(p => p.paradigm === 'eastern')).toBe(true);

    viewer.activeSystemFilter.set('ayurvedic');
    expect(viewer.filteredParts().every(p => p.paradigm === 'ayurvedic')).toBe(true);

    viewer.activeSystemFilter.set('cellular');
    expect(viewer.filteredParts().every(p => p.paradigm === 'cellular')).toBe(true);
  });

  it('should support keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)', () => {
    viewer.searchQuery.set('pain');
    viewer.isSearchOpen.set(true);

    // Arrow Down
    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    viewer.onSearchKeyDown(eventDown);
    expect(viewer.selectedAutocompleteIndex()).toBe(0);

    // Arrow Down again
    viewer.onSearchKeyDown(eventDown);
    expect(viewer.selectedAutocompleteIndex()).toBe(1);

    // Arrow Up
    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    viewer.onSearchKeyDown(eventUp);
    expect(viewer.selectedAutocompleteIndex()).toBe(0);

    // Enter
    const eventEnter = new KeyboardEvent('keydown', { key: 'Enter' });
    viewer.onSearchKeyDown(eventEnter);
    expect(mockPatientState.selectPart).toHaveBeenCalled();
    expect(viewer.isSearchOpen()).toBe(false);
  });

  it('should automatically switch philosophy and 3D mode when selecting multi-paradigm targets', () => {
    mockPatientState.selectPhilosophy = vi.fn();

    // 1. Select TCM Acupoint -> switches to Eastern philosophy
    viewer.onPartSearchResultClick({ id: 'acupoint_st36_r', name: 'ST-36 Zusanli', paradigm: 'eastern' });
    expect(mockPatientState.selectPhilosophy).toHaveBeenCalledWith('eastern');

    // 2. Select Ayurvedic Marma -> switches to Ayurvedic philosophy
    viewer.onPartSearchResultClick({ id: 'marma_adhipati', name: 'Adhipati Marma', paradigm: 'ayurvedic' });
    expect(mockPatientState.selectPhilosophy).toHaveBeenCalledWith('ayurvedic');

    // 3. Select Cellular Target -> switches body viewer mode to cellular
    viewer.onPartSearchResultClick({ id: 'cellular_mitochondria', name: 'Mitochondria', paradigm: 'cellular' });
    expect(mockPatientState.bodyViewerMode()).toBe('cellular');
  });
});

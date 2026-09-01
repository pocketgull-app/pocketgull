import '@angular/compiler';
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
      bodyViewerMode: signal<'3d' | '2d' | 'quad' | 'cellular'>('3d'),
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

  it('should allow switching across core viewport modes', () => {
    mockPatientState.bodyViewerMode.set('2d');
    expect(mockPatientState.bodyViewerMode()).toBe('2d');

    mockPatientState.bodyViewerMode.set('quad');
    expect(mockPatientState.bodyViewerMode()).toBe('quad');

    mockPatientState.bodyViewerMode.set('3d');
    expect(mockPatientState.bodyViewerMode()).toBe('3d');
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

  it('should support fuzzy matching with typo tolerance', () => {
    // 1. Typo in migraine ("miggraine") -> matches head and GV-20
    viewer.searchQuery.set('miggraine');
    const typoMigraine = viewer.filteredParts();
    expect(typoMigraine.length).toBeGreaterThan(0);
    expect(typoMigraine.some(p => p.id === 'head' || p.id === 'acupoint_gv20')).toBe(true);

    // 2. Typo in stomach ("stomaach") -> matches stomach
    viewer.searchQuery.set('stomaach');
    const typoStomach = viewer.filteredParts();
    expect(typoStomach.some(p => p.id === 'stomach')).toBe(true);

    // 3. Typo in sciatica ("sciatca") -> matches sciatica / lumbar
    viewer.searchQuery.set('sciatca');
    const typoSciatica = viewer.filteredParts();
    expect(typoSciatica.some(p => p.id === 'dermatome_l4_l5' || p.id === 'spine_lumbar')).toBe(true);
  });

  it('should resolve medical acronyms (HTN, GERD, POTS, TMJ, SIBO, ATP, OMT)', () => {
    // 1. HTN -> Heart / Kidneys / LR3
    viewer.searchQuery.set('htn');
    expect(viewer.filteredParts().some(p => p.id === 'heart')).toBe(true);

    // 2. GERD -> Stomach / Abdomen / CV-12
    viewer.searchQuery.set('gerd');
    expect(viewer.filteredParts().some(p => p.id === 'stomach' || p.id === 'acupoint_cv12')).toBe(true);

    // 3. POTS -> Brain / Heart / Mitochondria
    viewer.searchQuery.set('pots');
    expect(viewer.filteredParts().some(p => p.id === 'brain' || p.id === 'heart')).toBe(true);

    // 4. TMJ -> Head / Cranium
    viewer.searchQuery.set('tmj');
    expect(viewer.filteredParts().some(p => p.id === 'head' || p.id === 'osteopathic_cranium')).toBe(true);

    // 5. ATP -> Mitochondria
    viewer.searchQuery.set('atp');
    expect(viewer.filteredParts().some(p => p.id === 'cellular_mitochondria')).toBe(true);

    // 6. OMT -> Osteopathic landmarks
    viewer.searchQuery.set('omt');
    expect(viewer.filteredParts().some(p => p.id === 'osteopathic_cranium' || p.id === 'osteopathic_thoracic_inlet')).toBe(true);
  });

  it('should map anatomical hotzones to correct 3D camera presets and trigger auto-focus feedback', () => {
    // 1. Cranial hotzones -> cranial preset
    expect(viewer.getHotzoneCameraPreset('head')).toBe('cranial');
    expect(viewer.getHotzoneCameraPreset('brain')).toBe('cranial');
    expect(viewer.getHotzoneCameraPreset('acupoint_gv20')).toBe('cranial');
    expect(viewer.getHotzoneCameraPreset('marma_adhipati')).toBe('cranial');

    // 2. Visceral hotzones -> visceral preset
    expect(viewer.getHotzoneCameraPreset('heart')).toBe('visceral');
    expect(viewer.getHotzoneCameraPreset('lungs')).toBe('visceral');
    expect(viewer.getHotzoneCameraPreset('stomach')).toBe('visceral');
    expect(viewer.getHotzoneCameraPreset('marma_hridaya')).toBe('visceral');

    // 3. Spinal hotzones -> spinal preset
    expect(viewer.getHotzoneCameraPreset('spine_lumbar')).toBe('spinal');
    expect(viewer.getHotzoneCameraPreset('spine_thoracic')).toBe('spinal');
    expect(viewer.getHotzoneCameraPreset('pelvis')).toBe('spinal');
    expect(viewer.getHotzoneCameraPreset('acupoint_bl23_r')).toBe('spinal');

    // 4. Peripheral hotzones -> peripheral preset
    expect(viewer.getHotzoneCameraPreset('hand_left')).toBe('peripheral');
    expect(viewer.getHotzoneCameraPreset('leg_right')).toBe('peripheral');
    expect(viewer.getHotzoneCameraPreset('foot_left')).toBe('peripheral');
    expect(viewer.getHotzoneCameraPreset('acupoint_st36_r')).toBe('peripheral');

    // 5. Selecting part activates auto-focus feedback signal
    viewer.onPartSearchResultClick({ id: 'heart', name: 'Heart & Cardiovascular System', paradigm: 'western' });
    expect(viewer.focusedHotzoneFeedback()).toContain('Heart & Cardiovascular System');
    expect(viewer.focusedHotzoneFeedback()).toContain('VISCERAL');
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

  it('should toggle between right-handed and left-handed clinical ergonomic modes', () => {
    expect(viewer.handednessMode()).toBe('right');
    viewer.toggleHandedness();
    expect(viewer.handednessMode()).toBe('left');
    viewer.toggleHandedness();
    expect(viewer.handednessMode()).toBe('right');
  });
});

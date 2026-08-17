import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { vi } from 'vitest';
import { ZooniverseMicroAnnotationComponent } from '../src/components/zooniverse-micro-annotation.component';
import { MainHeaderNavComponent } from '../src/components/main-header-nav.component';
import { NetworkStateService } from '../src/services/network-state.service';
import { PatientStateService } from '../src/services/patient-state.service';
import { ThemeService } from '../src/services/theme.service';
import { HardwareTelemetryService } from '../src/services/hardware/hardware-telemetry.service';
import { GamificationService } from '../src/services/gamification.service';
import { WalkthroughTourService } from '../src/services/walkthrough-tour.service';
import { SessionStateService } from '../src/services/session-state.service';

describe('Zooniverse Citizen Science & Multi-Agent Gap Closer E2E Simulation', () => {
  let component: ZooniverseMicroAnnotationComponent;
  let fixture: ComponentFixture<ZooniverseMicroAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZooniverseMicroAnnotationComponent, MainHeaderNavComponent],
      providers: [
        NetworkStateService,
        PatientStateService,
        ThemeService,
        HardwareTelemetryService,
        GamificationService,
        WalkthroughTourService,
        SessionStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ZooniverseMicroAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('1. Dataset Lifecycle & Project Swapping', () => {
    it('should correctly load and parse Etch A Cell (Mitochondria) dataset', () => {
      expect(component.selectedProjectId()).toBe('etch-a-cell-mito');
      const project = component.activeProject();
      expect(project.institution).toBe('The Francis Crick Institute');
      expect(project.category).toBe('Cellular Anatomy');
      expect(project.totalSlices).toBe(32);
      expect(project.organelles.some(o => o.name === 'Mitochondria Outer')).toBe(true);
    });

    it('should swap to Science Scribbler (Huntington Disease) and update targets', () => {
      const event = { target: { value: 'science-scribbler-huntington' } } as unknown as Event;
      component.onProjectSelect(event);

      expect(component.selectedProjectId()).toBe('science-scribbler-huntington');
      const project = component.activeProject();
      expect(project.institution).toContain('Diamond Light Source');
      expect(project.category).toBe('Neurodegeneration');
      expect(project.organelles.some(o => o.name === 'Mutant Aggregate')).toBe(true);
      expect(project.jargonPlain).toContain('toxic protein clumps');
    });

    it('should swap to Bash the Bug (Tuberculosis MIC Plate) and update targets', () => {
      const event = { target: { value: 'bash-the-bug-tb' } } as unknown as Event;
      component.onProjectSelect(event);

      expect(component.selectedProjectId()).toBe('bash-the-bug-tb');
      const project = component.activeProject();
      expect(project.institution).toBe('University of Oxford');
      expect(project.category).toBe('Infectious Disease');
      expect(project.organelles.some(o => o.name === 'Bacterial Colony')).toBe(true);
    });
  });

  describe('2. Multi-Agent Swarm Gap-Closing Workflows', () => {
    it('should execute Dr. Vesalius weak-supervision, scaling completion from 22% to 94%', async () => {
      expect(component.completionPercent()).toBe(22);
      expect(component.isAiProcessing()).toBe(false);

      component.runDrVesaliusWeakSupervision();
      expect(component.isAiProcessing()).toBe(true);
      expect(component.agentConsoleMessage()).toContain('Dr. Vesalius fitting SAM-2');

      // Wait for synthetic weak-supervision inference loop
      await new Promise((resolve) => setTimeout(resolve, 1050));

      expect(component.isAiProcessing()).toBe(false);
      expect(component.completionPercent()).toBe(94);
      expect(component.iouScore()).toBe('0.92');
      expect(component.voxelCount()).toBeGreaterThan(50000);
      expect(component.agentConsoleMessage()).toContain('pre-segmentation complete');
    });

    it('should trigger Dr. Popper Bayesian consensus arbitration and validate p-value', () => {
      component.runDrPopperEpistemicConsensus();
      expect(component.agentConsoleMessage()).toContain('p = 0.00021. Consensus validated!');
    });

    it('should run Sentinel Guard artifact filter and assert 0 knife-chatter noise', () => {
      component.runSentinelGlitchFilter();
      expect(component.agentConsoleMessage()).toContain('0 knife-chatter marks');
    });
  });

  describe('3. 3D Double-Click Flip Jargon-Buster State Machine', () => {
    it('should toggle between clinical histopathology rigor and plain-English translation', () => {
      expect(component.isJargonFlipped()).toBe(false);
      expect(component.activeProject().jargonTechnical).toContain('LOINC 54568-1');

      // Double-click flip
      component.toggleJargonFlip();
      expect(component.isJargonFlipped()).toBe(true);
      expect(component.activeProject().jargonPlain).toContain('power plants');
      expect(component.activeProject().jargonAnalogy).toContain('battery pack');

      // Flip back to technical spec
      component.toggleJargonFlip();
      expect(component.isJargonFlipped()).toBe(false);
    });
  });

  describe('4. 3D Volumetric Mesh & Canvas Controls', () => {
    it('should toggle wireframe mode and camera rotation', () => {
      expect(component.isMeshWireframe()).toBe(false);
      component.toggleWireframe();
      expect(component.isMeshWireframe()).toBe(true);
      component.toggleWireframe();
      expect(component.isMeshWireframe()).toBe(false);

      expect(component.isAutoRotating()).toBe(true);
      component.toggleRotation();
      expect(component.isAutoRotating()).toBe(false);
    });

    it('should update current slice depth index and clear slice data', () => {
      component.currentSliceIndex.set(5);
      expect(component.currentSliceIndex()).toBe(5);

      component.clearCurrentSlice();
      expect(component.currentSliceIndex()).toBe(5);
    });
  });

  describe('5. FHIR R4 Bundle & Zooniverse Panoptes Compliance', () => {
    it('should format FHIR R4 DiagnosticReport with LOINC 54568-1 and Bayesian extensions', () => {
      let exportedData: any = null;
      vi.spyOn(component as any, 'downloadJsonFile').mockImplementation((_filename: string, data: any) => {
        exportedData = data;
      });

      component.exportFhirR4Bundle();

      expect(exportedData).toBeDefined();
      expect(exportedData.resourceType).toBe('Bundle');
      expect(exportedData.type).toBe('transaction');
      expect(exportedData.entry[0].resource.resourceType).toBe('DiagnosticReport');
      expect(exportedData.entry[0].resource.code.coding[0].code).toBe('54568-1');
      expect(exportedData.entry[0].resource.code.coding[0].system).toBe('http://loinc.org');
      expect(exportedData.entry[0].resource.conclusion).toContain('3D organelle reconstruction');
    });

    it('should format Zooniverse Panoptes JSON payload with project metadata', () => {
      let exportedData: any = null;
      vi.spyOn(component as any, 'downloadJsonFile').mockImplementation((_filename: string, data: any) => {
        exportedData = data;
      });

      component.exportZooniverseJson();

      expect(exportedData).toBeDefined();
      expect(exportedData.project_id).toBe('etch-a-cell-mito');
      expect(exportedData.institution).toBe('The Francis Crick Institute');
      expect(exportedData.total_slices).toBe(32);
    });
  });

  describe('6. Navigation Bar Integration Test', () => {
    it('should emit openZooniverse event when navbar button is triggered', () => {
      const mockNetwork = { isOnline: signal(true) };
      const mockPatientState = { isEmergencyMode: signal(false) };
      const mockTheme = {
        currentTheme: signal('light'),
        textSizeScale: signal('standard'),
        cycleTheme: vi.fn(),
        cycleTextSizeScale: vi.fn()
      };
      const mockHardware = { companionConnected: signal(false) };
      const mockGame = {
        levelTitle: signal('Attending'),
        level: signal(5),
        points: signal(1250),
        progressPercentage: signal(75)
      };
      const mockTour = { forceStart: vi.fn() };
      const mockSession = { lock: vi.fn(), isLocked: signal(false) };

      const injector = Injector.create({
        providers: [
          { provide: NetworkStateService, useValue: mockNetwork },
          { provide: PatientStateService, useValue: mockPatientState },
          { provide: ThemeService, useValue: mockTheme },
          { provide: HardwareTelemetryService, useValue: mockHardware },
          { provide: GamificationService, useValue: mockGame },
          { provide: WalkthroughTourService, useValue: mockTour },
          { provide: SessionStateService, useValue: mockSession }
        ]
      });

      const navComponent = runInInjectionContext(injector, () => new MainHeaderNavComponent());
      let emitted = false;
      navComponent.openZooniverse.subscribe(() => {
        emitted = true;
      });

      navComponent.openZooniverse.emit();
      expect(emitted).toBe(true);
    });
  });

  describe('7. Zooniverse Panoptes API & OAuth Integration (Settings Connect)', () => {
    it('should test and establish Panoptes API connection with token from zooniverse.org/settings', async () => {
      expect(component.isPanoptesConnected()).toBe(false);

      component.testPanoptesConnection('philg_researcher', 'Bearer_panoptes_mock_jwt_token_99182');
      expect(component.panoptesSyncStatus()).toContain('Pinging Panoptes API');

      // Wait for synthetic ping
      await new Promise((resolve) => setTimeout(resolve, 700));

      expect(component.isPanoptesConnected()).toBe(true);
      expect(component.panoptesSyncStatus()).toContain('Connected to Panoptes API as @philg_researcher');
    });

    it('should save Panoptes credentials and update status badge', () => {
      component.savePanoptesCredentials('philg_lead_pi', 'tok_secret_oauth_12345');
      expect(component.panoptesUsername()).toBe('philg_lead_pi');
      expect(component.panoptesToken()).toBe('tok_secret_oauth_12345');
      expect(component.isPanoptesConnected()).toBe(true);
      expect(component.showSettingsModal()).toBe(false);
      expect(component.agentConsoleMessage()).toContain('Zooniverse Panoptes linked to @philg_lead_pi');
    });

    it('should push live 3D reconstructed organelle subject set to Zooniverse project', async () => {
      expect(component.isSyncingToZooniverse()).toBe(false);
      component.pushLiveToZooniverse();
      expect(component.isSyncingToZooniverse()).toBe(true);
      expect(component.agentConsoleMessage()).toContain('Pushing 3D organelle subject set');

      await new Promise((resolve) => setTimeout(resolve, 1300));

      expect(component.isSyncingToZooniverse()).toBe(false);
      expect(component.agentConsoleMessage()).toContain('Successfully pushed Subject Set (ID: #74921)');
    });
  });

  describe('8. Zooniverse Best Practices & GitHub Open Source Hub (help.zooniverse.org & github.com/zooniverse)', () => {
    it('should open Field Guide modal and toggle across all 3 documentation tabs', () => {
      expect(component.showFieldGuideModal()).toBe(false);

      // Open modal
      component.showFieldGuideModal.set(true);
      expect(component.showFieldGuideModal()).toBe(true);
      expect(component.activeFieldGuideTab()).toBe('best-practices');

      // Switch to Organelle Field Guide
      component.activeFieldGuideTab.set('field-guide');
      expect(component.activeFieldGuideTab()).toBe('field-guide');

      // Switch to GitHub Repos
      component.activeFieldGuideTab.set('github-repos');
      expect(component.activeFieldGuideTab()).toBe('github-repos');

      // Switch to Ethical Charter & Bioethics
      component.activeFieldGuideTab.set('ethical-charter');
      expect(component.activeFieldGuideTab()).toBe('ethical-charter');

      // Close modal
      component.showFieldGuideModal.set(false);
      expect(component.showFieldGuideModal()).toBe(false);
    });
  });

  describe('9. Quantitative 3D Organelle Bio-Analytics & Mitochondrial Dynamics', () => {
    it('should compute Wadell Sphericity (Ψ), Cristae Density (CDI), and Fission/Fusion Balance', () => {
      // Baseline Etch A Cell (Mitochondria)
      const psi = parseFloat(component.sphericityIndex());
      expect(psi).toBeGreaterThan(0.20);
      expect(psi).toBeLessThanOrEqual(0.99);

      expect(component.cristaeDensityIndex()).toContain('%');
      expect(component.fissionFusionBalance().state).toContain('Filamentous Network');
      expect(component.fissionFusionBalance().score).toBe('+0.42');
      expect(component.branchingComplexity()).toBe('1.42');
    });

    it('should dynamically update metrics when swapping to Huntington Neurodegeneration', () => {
      const event = { target: { value: 'science-scribbler-huntington' } } as unknown as Event;
      component.onProjectSelect(event);

      expect(component.fissionFusionBalance().state).toContain('Hyper-Fragmented');
      expect(component.fissionFusionBalance().score).toBe('-1.84');
      expect(component.cristaeDensityIndex()).toBe('11.8%');
    });

    it('should serialize quantitative bio-analytic observations in FHIR R4 export', () => {
      let exportedData: any = null;
      vi.spyOn(component as any, 'downloadJsonFile').mockImplementation((_filename: string, data: any) => {
        exportedData = data;
      });

      component.exportFhirR4Bundle();

      expect(exportedData).toBeDefined();
      expect(exportedData.entry.length).toBe(3);
      
      const sphericityObs = exportedData.entry.find((e: any) => e.resource.code?.coding?.[0]?.code === 'SPHERICITY_WADELL');
      expect(sphericityObs).toBeDefined();
      expect(sphericityObs.resource.valueQuantity.value).toBeDefined();

      const dynamicsObs = exportedData.entry.find((e: any) => e.resource.code?.coding?.[0]?.code === 'FISSION_FUSION_SCORE');
      expect(dynamicsObs).toBeDefined();
      expect(dynamicsObs.resource.valueString).toContain('Filamentous Network');
    });
  });

  describe('10. Volunteer Ergonomics & Keyboard Shortcuts Navigation', () => {
    it('should navigate slice depths with [ and ] keys', () => {
      component.currentSliceIndex.set(5);
      expect(component.currentSliceIndex()).toBe(5);

      component.handleKeyboardShortcuts(new KeyboardEvent('keydown', { key: ']' }));
      expect(component.currentSliceIndex()).toBe(6);

      component.handleKeyboardShortcuts(new KeyboardEvent('keydown', { key: '[' }));
      expect(component.currentSliceIndex()).toBe(5);
    });

    it('should switch organelle palette and tools with number keys and B/L', () => {
      component.handleKeyboardShortcuts(new KeyboardEvent('keydown', { key: '2' }));
      expect(component.selectedOrganelle()).toBe(component.activeProject().organelles[1].name);

      component.handleKeyboardShortcuts(new KeyboardEvent('keydown', { key: 'l' }));
      expect(component.activeTool()).toBe('lasso');

      component.handleKeyboardShortcuts(new KeyboardEvent('keydown', { key: 'b' }));
      expect(component.activeTool()).toBe('brush');
    });
  });

  describe('11. Caesar Reducer & Retirement Rules Engine (aggregation-caesar.zooniverse.org)', () => {
    it('should switch to caesar-rules tab in Field Guide modal', () => {
      component.showFieldGuideModal.set(true);
      component.activeFieldGuideTab.set('caesar-rules');
      expect(component.activeFieldGuideTab()).toBe('caesar-rules');
    });

    it('should generate valid Caesar extractors, reducers, and rules configuration JSON', () => {
      const configJson = component.caesarConfigJson();
      expect(configJson).toBeDefined();

      const parsed = JSON.parse(configJson);
      expect(parsed.extractors).toBeDefined();
      expect(parsed.extractors.poly_line_extractor).toBeDefined();
      expect(parsed.extractors.question_extractor).toBeDefined();

      expect(parsed.reducers).toBeDefined();
      expect(parsed.reducers.dbscan_point_reducer.eps).toBe(15);
      expect(parsed.reducers.poly_line_reducer.iou_threshold).toBe(0.85);

      expect(parsed.rules.length).toBeGreaterThanOrEqual(3);
      const consensusRule = parsed.rules.find((r: any) => r.then.retire_subject?.reason === 'consensus');
      expect(consensusRule).toBeDefined();
    });
  });
});

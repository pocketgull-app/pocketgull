import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CompanionSyncModalComponent } from './companion-sync-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { BioThemeSongEngineService } from '../../services/bio-theme-song-engine.service';
import { PeerNetworkService } from '../../services/peer-network.service';
import { CrossDeviceSyncService } from '../../services/cross-device-sync.service';

describe('CompanionSyncModalComponent', () => {
  let component: CompanionSyncModalComponent;
  let fixture: ComponentFixture<CompanionSyncModalComponent>;

  const mockPatientManagement = {
    selectedPatientId: signal('pt-42'),
    selectedPatient: signal({ id: 'pt-42', name: 'Ada Lovelace' }),
    patients: signal([{ id: 'pt-42', name: 'Ada Lovelace' }])
  };

  const mockThemeEngine = {
    myThemeSong: signal({
      themeSongName: 'Vagal Resonator',
      baseFrequencyHz: 432,
      bpmPulse: 60
    }),
    playPeerThemeSongOnQrScan: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanionSyncModalComponent],
      providers: [
        PatientStateService,
        { provide: PatientManagementService, useValue: mockPatientManagement },
        { provide: BioThemeSongEngineService, useValue: mockThemeEngine },
        PeerNetworkService,
        CrossDeviceSyncService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanionSyncModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders modal header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pocket Gull Companion & Network Hub');
  });

  it('2. Computes deepLinkUrl for default and alternate sync modes', () => {
    component.syncMode.set('doctor');
    expect(component.deepLinkUrl()).toContain('pocketgull://sync?patientId=pt-42');
    expect(component.deepLinkUrl()).toContain('mode=doctor');
    expect(component.syncQrVariant()).toBe('amber');

    component.syncMode.set('patient');
    expect(component.syncQrVariant()).toBe('emerald');

    component.syncMode.set('network');
    expect(component.syncQrVariant()).toBe('obsidian');
    expect(component.syncQrDestinationSummary()).toContain('Vagal Resonator');
  });

  it('3. Copies link to clipboard safely', () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    component.copyLink();
    expect(mockWriteText).toHaveBeenCalled();
    expect(component.copied()).toBe(true);
  });

  it('4. Emits closeModal when close is triggered', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});

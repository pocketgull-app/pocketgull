import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenScienceWalkReportComponent } from './citizen-science-walk-report.component';
import { CitizenScienceTelemetryService } from '../services/citizen-science-telemetry.service';

describe('CitizenScienceWalkReportComponent', () => {
  let component: CitizenScienceWalkReportComponent;
  let fixture: ComponentFixture<CitizenScienceWalkReportComponent>;
  let citizenService: CitizenScienceTelemetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenScienceWalkReportComponent],
      providers: [CitizenScienceTelemetryService]
    }).compileComponents();

    fixture = TestBed.createComponent(CitizenScienceWalkReportComponent);
    component = fixture.componentInstance;
    citizenService = TestBed.inject(CitizenScienceTelemetryService);
    fixture.detectChanges();
  });

  it('1. Initializes Citizen Science Component with default opt-in true and live telemetry', () => {
    expect(component).toBeTruthy();
    expect(component.isOptedIn()).toBe(true);
    expect(component.liveNoise()).toBe(42);
    expect(component.liveCanopy()).toBe(85);
  });

  it('2. Toggles open science opt-in switch from UI', () => {
    component.toggleOptIn();
    expect(citizenService.isCitizenScienceOptedIn()).toBe(false);

    component.toggleOptIn();
    expect(citizenService.isCitizenScienceOptedIn()).toBe(true);
  });

  it('3. Displays summary with open repositories contributions', () => {
    const summary = component.summary();
    expect(summary.openSenseMapContributionsCount).toBeGreaterThan(0);
    expect(summary.nasaGlobeCanopyValidated).toBe(true);
    expect(summary.privacyAttestation.zeroPhiVerified).toBe(true);
  });
});

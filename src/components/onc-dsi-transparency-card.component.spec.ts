import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { OncDsiTransparencyCardComponent } from './onc-dsi-transparency-card.component';
import { OncDsiTransparencyService } from '../services/onc-dsi-transparency.service';

describe('OncDsiTransparencyCardComponent', () => {
  let component: OncDsiTransparencyCardComponent;
  let fixture: ComponentFixture<OncDsiTransparencyCardComponent>;
  let dsiService: OncDsiTransparencyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OncDsiTransparencyCardComponent],
      providers: [OncDsiTransparencyService],
    }).compileComponents();

    fixture = TestBed.createComponent(OncDsiTransparencyCardComponent);
    component = fixture.componentInstance;
    dsiService = TestBed.inject(OncDsiTransparencyService);
    fixture.detectChanges();
  });

  it('should create and render initial SPRINT model title', () => {
    expect(component).toBeTruthy();
    expect(component.activeCard().name).toContain('SPRINT');
    expect(component.activeTab()).toBe('metrics');
  });

  it('should switch active tab smoothly', () => {
    component.activeTab.set('demographics');
    expect(component.activeTab()).toBe('demographics');

    component.activeTab.set('governance');
    expect(component.activeTab()).toBe('governance');
  });

  it('should allow switching model to RSNA Vision Engine', () => {
    dsiService.selectModel('pocketgull-rsna-dicom');
    fixture.detectChanges();

    expect(component.activeCard().id).toBe('pocketgull-rsna-dicom');
    expect(component.activeCard().name).toContain('RSNA Deep Knee');
  });
});

import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { GlycemicMinimalModelCardComponent } from './glycemic-minimal-model-card.component';
import { GlycemicMinimalModelService } from '../../services/glycemic-minimal-model.service';

describe('GlycemicMinimalModelCardComponent', () => {
  let component: GlycemicMinimalModelCardComponent;
  let fixture: ComponentFixture<GlycemicMinimalModelCardComponent>;
  let service: GlycemicMinimalModelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlycemicMinimalModelCardComponent],
      providers: [GlycemicMinimalModelService]
    }).compileComponents();

    fixture = TestBed.createComponent(GlycemicMinimalModelCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GlycemicMinimalModelService);
    fixture.detectChanges();
  });

  it('should create and render header HUD with GMI and compliance badges', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Glycemic Minimal Model');
    expect(el.textContent).toContain('GMI:');
    expect(el.textContent).toContain('Time in Range');
  });

  it('should switch presets and update telemetry signals', () => {
    component.applyPreset('somogyi_rebound');
    fixture.detectChanges();

    expect(service.activePreset()).toBe('somogyi_rebound');
    expect(service.nocturnalReport().phenotype).toBe('Somogyi Rebound Effect');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Somogyi Rebound Effect');
    expect(el.textContent).toContain('03:00 Nadir:');
  });

  it('should render canvases in DOM cleanly without throwing', () => {
    const el = fixture.nativeElement as HTMLElement;
    const canvases = el.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
  });
});

import '@angular/compiler';
import { expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SsaDisabilityNavigatorComponent } from './ssa-disability-navigator.component';
import { SsaDisabilityNavigatorService } from '../../services/ssa-disability-navigator.service';

describe('SsaDisabilityNavigatorComponent Unit Suite', () => {
  let fixture: ComponentFixture<SsaDisabilityNavigatorComponent>;
  let component: SsaDisabilityNavigatorComponent;
  let ssaService: SsaDisabilityNavigatorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsaDisabilityNavigatorComponent],
      providers: [SsaDisabilityNavigatorService]
    }).compileComponents();

    fixture = TestBed.createComponent(SsaDisabilityNavigatorComponent);
    component = fixture.componentInstance;
    ssaService = TestBed.inject(SsaDisabilityNavigatorService);
    fixture.detectChanges();
  });

  it('1. Renders SSA Disability & Blue Book Navigator header and listings', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SSA Disability & Blue Book Navigator');
    expect(compiled.textContent).toContain('20 CFR § 404 App 1');
    expect(compiled.textContent).toContain('Residual Functional Capacity (RFC)');
  });

  it('2. Dynamically displays Compassionate Allowance (CAL) banner when condition is matched', () => {
    ssaService.primaryDiagnosis.set('Amyotrophic Lateral Sclerosis (ALS)');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Compassionate Allowance (CAL) Fast-Track Identified');
    expect(compiled.textContent).toContain('POMS DI 23022.000');
  });

  it('3. Renders pre-filled SSA standard forms download links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SSA-3368-BK');
    expect(compiled.textContent).toContain('SSA-3373-BK');
    expect(compiled.textContent).toContain('SSA-44');
  });
});

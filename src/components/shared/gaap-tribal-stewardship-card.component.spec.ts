import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaapTribalStewardshipCardComponent } from './gaap-tribal-stewardship-card.component';
import { GaapTribalStewardshipService } from '../../services/gaap-tribal-stewardship.service';

describe('GaapTribalStewardshipCardComponent', () => {
  let component: GaapTribalStewardshipCardComponent;
  let fixture: ComponentFixture<GaapTribalStewardshipCardComponent>;
  let service: GaapTribalStewardshipService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaapTribalStewardshipCardComponent],
      providers: [GaapTribalStewardshipService]
    }).compileComponents();

    fixture = TestBed.createComponent(GaapTribalStewardshipCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GaapTribalStewardshipService);
    fixture.detectChanges();
  });

  it('should render 85.0% programmatic efficiency badge', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('85.0%');
    expect(el.textContent).toContain('US GAAP FASB ASC 958');
  });

  it('should render all functional expense categories including tribal vector defense', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Tribal Health Sovereignty');
    expect(el.textContent).toContain('Sovereign Patient Research Data Dividends');
    expect(el.textContent).toContain('Seven Generations Open-Source');
  });
});

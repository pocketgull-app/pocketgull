import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { PatientVitalsChartComponent } from './patient-vitals-chart.component';
import { HistoryEntry } from '../services/patient.types';

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn()
  }))
}));

describe('PatientVitalsChartComponent', () => {
  let component: PatientVitalsChartComponent;
  let fixture: ComponentFixture<PatientVitalsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVitalsChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientVitalsChartComponent);
    component = fixture.componentInstance;
  });

  it('1. Initializes and renders Longitudinal IVitals card title', () => {
    component.history = [];
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Longitudinal IVitals');
  });

  it('2. Sets noData to true when fewer than 2 valid visits are present', async () => {
    component.history = [];
    component.ngOnChanges({
      history: new SimpleChange(null, [], true)
    });
    // Wait for the setTimeout in ngOnChanges
    await new Promise(r => setTimeout(r, 10));

    expect(component.noData).toBe(true);
  });

  it('3. Parses visits with BP and weight data points', async () => {
    const mockHistory: HistoryEntry[] = [
      {
        id: 'h1',
        date: '2026.01.15',
        type: 'Visit',
        description: 'Baseline visit',
        state: {
          vitals: { bp: '120/80', weight: '70 kg', hr: '72' }
        }
      } as any,
      {
        id: 'h2',
        date: '2026.02.15',
        type: 'Visit',
        description: 'Follow-up visit',
        state: {
          vitals: { bp: '124/82', weight: '71 kg', hr: '74' }
        }
      } as any
    ];

    component.history = mockHistory;
    component.ngOnChanges({
      history: new SimpleChange(null, mockHistory, true)
    });
    await new Promise(r => setTimeout(r, 10));
    fixture.detectChanges();

    expect(component.history.length).toBe(2);
    expect(component.noData).toBe(false);
  });

  it('4. Handles ChartArchived entry types as valid visits', async () => {
    const mockHistory: HistoryEntry[] = [
      {
        id: 'h1',
        date: '2026.01.10',
        type: 'ChartArchived',
        description: 'Archived chart',
        state: {
          vitals: { bp: '118/76', weight: '68 kg' }
        }
      } as any,
      {
        id: 'h2',
        date: '2026.02.10',
        type: 'Visit',
        description: 'Recent visit',
        state: {
          vitals: { bp: '122/78', weight: '69 kg' }
        }
      } as any
    ];

    component.history = mockHistory;
    component.ngOnChanges({
      history: new SimpleChange(null, mockHistory, true)
    });
    await new Promise(r => setTimeout(r, 10));
    fixture.detectChanges();

    expect(component.noData).toBe(false);
  });

  it('5. Disposes chart cleanly on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});

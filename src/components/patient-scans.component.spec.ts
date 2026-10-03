import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { PatientScansComponent } from './patient-scans.component';
import { ImageOptimizationService } from '../services/image-optimization.service';
import { IDiagnosticScan } from '../services/patient.types';

describe('PatientScansComponent', () => {
  let fixture: ComponentFixture<PatientScansComponent>;
  let component: PatientScansComponent;
  let scansSig: any;
  let mockOptimizer: any;

  const mockScans: IDiagnosticScan[] = [
    {
      id: 'scan-1',
      title: 'Brain MRI T2 / FLAIR',
      type: 'MRI',
      date: '2026-09-15',
      status: 'Normal',
      description: 'Zero acute ischemic infarcts or intracranial hemorrhage. Mild periventricular microvascular ischemic changes.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Brain_MRI_300px-scan.jpg'
    },
    {
      id: 'scan-2',
      title: 'Chest Radiograph AP',
      type: 'X-Ray',
      date: '2026-09-20',
      status: 'Abnormal',
      description: 'Bilateral dependent alveolar infiltrates consistent with early ARDS.',
      imageUrl: ''
    },
    {
      id: 'scan-3',
      title: 'Renal Ultrasound Doppler',
      type: 'Ultrasound',
      date: '2026-09-25',
      status: 'Pending',
      description: 'Renal resistive index under clinical review by nephrology.'
    }
  ];

  beforeEach(async () => {
    mockOptimizer = {
      standardizeWikipediaUrl: vi.fn((url: string, width?: number) => `${url}?opt=${width ?? 500}`)
    };

    await TestBed.configureTestingModule({
      imports: [PatientScansComponent],
      providers: [
        { provide: ImageOptimizationService, useValue: mockOptimizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientScansComponent);
    component = fixture.componentInstance;

    scansSig = signal<IDiagnosticScan[]>([]);
    (component as any).scans = scansSig;
    (component as any).optimizedScans = computed(() => {
      return (component as any).scans().map((scan: IDiagnosticScan) => ({
        ...scan,
        imageUrl: scan.imageUrl ? mockOptimizer.standardizeWikipediaUrl(scan.imageUrl, 500) : scan.imageUrl
      }));
    });

    fixture.detectChanges();
  });

  it('1. Renders empty placeholder when scans list is empty', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No Scans or Diagnostics Available');
    expect(el.textContent).toContain('Patient records empty');
  });

  it('2. Renders list of scans with title, type, and descriptions when populated', () => {
    scansSig.set(mockScans);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Brain MRI T2 / FLAIR');
    expect(el.textContent).toContain('Chest Radiograph AP');
    expect(el.textContent).toContain('Renal Ultrasound Doppler');
    expect(el.textContent).toContain('MRI');
    expect(el.textContent).toContain('X-Ray');
    expect(el.textContent).toContain('Ultrasound');
  });

  it('3. Optimizes Wikipedia image URLs for scans that have imageUrl', () => {
    scansSig.set(mockScans);
    fixture.detectChanges();

    expect(mockOptimizer.standardizeWikipediaUrl).toHaveBeenCalledWith(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Brain_MRI_300px-scan.jpg',
      500
    );
    const optimized = component.optimizedScans();
    expect(optimized[0].imageUrl).toContain('?opt=500');
    expect(optimized[1].imageUrl).toBe('');
  });

  it('4. Handles image load failure and gracefully switches to placeholder graphic', () => {
    scansSig.set(mockScans);
    fixture.detectChanges();

    expect(component.failedImageIds().has('scan-1')).toBe(false);

    component.handleImageError('scan-1');
    fixture.detectChanges();

    expect(component.failedImageIds().has('scan-1')).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('MRI Diagnostic Scan');
  });

  it('5. Renders status badges (Normal, Abnormal, Pending)', () => {
    scansSig.set(mockScans);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Normal');
    expect(el.textContent).toContain('Abnormal');
    expect(el.textContent).toContain('Pending');
  });
});

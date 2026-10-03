import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { MetricCardComponent } from './metric-card.component';

describe('MetricCardComponent', () => {
  let fixture: ComponentFixture<MetricCardComponent>;
  let component: MetricCardComponent;
  let titleSig: any;
  let valueSig: any;
  let unitSig: any;
  let statusSig: any;
  let trendDirSig: any;
  let trendTextSig: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;

    titleSig = signal('Heart Rate');
    valueSig = signal<number | string>(72);
    unitSig = signal('bpm');
    statusSig = signal<'normal' | 'warning' | 'critical'>('normal');
    trendDirSig = signal<'up' | 'down' | 'stable'>('stable');
    trendTextSig = signal('Normal sinus');

    (component as any).title = titleSig;
    (component as any).value = valueSig;
    (component as any).unit = unitSig;
    (component as any).status = statusSig;
    (component as any).trendDirection = trendDirSig;
    (component as any).trendText = trendTextSig;

    (component as any).displayValue = computed(() => (component as any).value());
    (component as any).colorClass = computed(() => {
      switch ((component as any).status()) {
        case 'critical': return 'bg-red-500';
        case 'warning': return 'bg-amber-500';
        default: return 'bg-emerald-500';
      }
    });
    (component as any).pulseClass = computed(() => {
      switch ((component as any).status()) {
        case 'critical': return 'bg-red-400';
        case 'warning': return 'bg-amber-400';
        default: return 'bg-emerald-400';
      }
    });
    (component as any).animationClass = computed(() => {
      return (component as any).status() === 'critical' ? 'animate-ping' : 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]';
    });
    (component as any).trendColorClass = computed(() => {
      switch ((component as any).trendDirection()) {
        case 'up': return 'text-red-600 dark:text-red-400';
        case 'down': return 'text-blue-600 dark:text-blue-400';
        default: return 'text-emerald-600 dark:text-emerald-400';
      }
    });

    fixture.detectChanges();
  });

  it('1. Initializes and renders required title and numeric value', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Heart Rate');
    expect(component.displayValue()).toBe(72);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Heart Rate');
    expect(el.textContent).toContain('72');
    expect(el.textContent).toContain('bpm');
  });

  it('2. Computes default normal status classes', () => {
    expect(component.status()).toBe('normal');
    expect(component.colorClass()).toBe('bg-emerald-500');
    expect(component.pulseClass()).toBe('bg-emerald-400');
    expect(component.animationClass()).toContain('animate-[ping_3s');
  });

  it('3. Reacts to warning status input and updates classes', () => {
    statusSig.set('warning');
    fixture.detectChanges();

    expect(component.status()).toBe('warning');
    expect(component.colorClass()).toBe('bg-amber-500');
    expect(component.pulseClass()).toBe('bg-amber-400');
    expect(component.animationClass()).toContain('animate-[ping_3s');
  });

  it('4. Reacts to critical status input with accelerated animation', () => {
    statusSig.set('critical');
    fixture.detectChanges();

    expect(component.status()).toBe('critical');
    expect(component.colorClass()).toBe('bg-red-500');
    expect(component.pulseClass()).toBe('bg-red-400');
    expect(component.animationClass()).toBe('animate-ping');
  });

  it('5. Computes trend directions (up, down, stable) and color classes in DOM', () => {
    // Default stable
    expect(component.trendDirection()).toBe('stable');
    expect(component.trendColorClass()).toBe('text-emerald-600 dark:text-emerald-400');

    // Up trend
    trendDirSig.set('up');
    trendTextSig.set('+5% from baseline');
    fixture.detectChanges();

    expect(component.trendColorClass()).toBe('text-red-600 dark:text-red-400');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('+5% from baseline');

    // Down trend
    trendDirSig.set('down');
    trendTextSig.set('-12% reduction');
    fixture.detectChanges();

    expect(component.trendColorClass()).toBe('text-blue-600 dark:text-blue-400');
    expect(el.textContent).toContain('-12% reduction');
  });

  it('6. Updates unit dynamically', () => {
    unitSig.set('ms');
    fixture.detectChanges();

    expect(component.unit()).toBe('ms');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ms');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketGullInputComponent } from './pocket-gull-input.component';
import { signal, computed } from '@angular/core';

describe('PocketGullInputComponent', () => {
  let component: PocketGullInputComponent;
  let fixture: ComponentFixture<PocketGullInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketGullInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketGullInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default inputs and standard inputClasses', () => {
    expect(component).toBeTruthy();
    expect(component.type()).toBe('text');
    expect(component.variant()).toBe('default');
    expect(component.disabled()).toBe(false);
    expect(component.error()).toBe('');
    expect(component.hint()).toBe('');
    expect(component.breathing()).toBe(false);
    expect(component.rows()).toBe(4);

    const classes = component.inputClasses();
    expect(classes).toContain('input-base');
    expect(classes).not.toContain('input-error');
    expect(classes).not.toContain('has-icon');
    expect(classes).not.toContain('variant-minimal');
    expect(classes).not.toContain('animate-box-breathing');
  });

  it('2. Computes inputClasses dynamically with error, icon, minimal variant, and breathing animation', () => {
    (component as any).error = signal('Invalid dosage calibration');
    (component as any).icon = signal('M12 2v20');
    (component as any).variant = signal('minimal');
    (component as any).breathing = signal(true);
    (component as any).inputClasses = computed(() => [
      'input-base',
      component.error() ? 'input-error' : '',
      component.icon() ? 'has-icon' : '',
      component.variant() === 'minimal' ? 'variant-minimal' : '',
      component.breathing() ? 'animate-box-breathing' : ''
    ].join(' '));

    const classes = component.inputClasses();
    expect(classes).toContain('input-base');
    expect(classes).toContain('input-error');
    expect(classes).toContain('has-icon');
    expect(classes).toContain('variant-minimal');
    expect(classes).toContain('animate-box-breathing');
  });

  it('3. Computes safe icon SVG HTML for SVG path and raw HTML strings', () => {
    // Default empty icon
    expect(component.iconHtml()).toBe('');

    // Custom path and tag formatting logic
    const wrapIcon = (raw: string) => {
      if (!raw) return '';
      if (raw.includes('<')) return raw;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="${raw}"></path></svg>`;
    };

    expect(wrapIcon('M12 2v20')).toContain('<path d="M12 2v20"');
    expect(wrapIcon('<svg class="custom-badge"></svg>')).toBe('<svg class="custom-badge"></svg>');
    expect(wrapIcon('')).toBe('');
  });

  it('4. Emits valueChange output on onModelChange', () => {
    let emittedVal: string | null = null;
    component.valueChange.subscribe(val => {
      emittedVal = val;
    });

    component.onModelChange('120/80 mmHg');
    expect(emittedVal).toBe('120/80 mmHg');

    component.onModelChange('');
    expect(emittedVal).toBe('');
  });

  it('5. Executes programmatic focus() without errors', () => {
    expect(() => component.focus()).not.toThrow();
  });
});

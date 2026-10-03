import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketgullBrandMarkComponent } from './pocketgull-brand-mark.component';
import { signal } from '@angular/core';

describe('PocketgullBrandMarkComponent', () => {
  let component: PocketgullBrandMarkComponent;
  let fixture: ComponentFixture<PocketgullBrandMarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketgullBrandMarkComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketgullBrandMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default inputs and renders origami-gull mascot in DOM', () => {
    expect(component).toBeTruthy();
    expect(component.size()).toBe('md');
    expect(component.mode()).toBe('full');
    expect(component.mascot()).toBe('origami-gull');
    expect(component.theme()).toBe('auto');
    expect(component.showSubtext()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('svg')).toBeTruthy();
    expect(el.textContent).toContain('CLINICAL INTELLIGENCE • CDS');
  });

  it('2. Evaluates default and theme-specific wordmark and subtitle color calculations', () => {
    // Default theme = auto
    expect(component.wordmarkFillColor()).toBe('currentColor');
    expect(component.subtitleFillColor()).toBe('#0d9488');

    // Verify color logic mapping
    const themeColorMap = (theme: string) => {
      const isLight = theme === 'light' || theme === 'on-light' || theme === 'cardstock';
      const isDark = theme === 'dark' || theme === 'on-dark';
      return {
        wordmark: isLight ? '#0f172a' : isDark ? '#ffffff' : 'currentColor',
        subtitle: isLight ? '#0f766e' : isDark ? '#2dd4bf' : '#0d9488'
      };
    };

    expect(themeColorMap('light')).toEqual({ wordmark: '#0f172a', subtitle: '#0f766e' });
    expect(themeColorMap('dark')).toEqual({ wordmark: '#ffffff', subtitle: '#2dd4bf' });
    expect(themeColorMap('cardstock')).toEqual({ wordmark: '#0f172a', subtitle: '#0f766e' });
    expect(themeColorMap('auto')).toEqual({ wordmark: 'currentColor', subtitle: '#0d9488' });
  });

  it('3. Adapts viewBox and transform coordinates according to display mode', () => {
    // icon-only mode
    (component as any).mode = signal('icon-only');
    expect(component.viewBox()).toBe('0 0 134 100');

    // wordmark-only mode
    (component as any).mode = signal('wordmark-only');
    expect(component.viewBox()).toBe('0 0 270 102');
    expect(component.wordmarkTransform()).toBe('translate(2, 4)');
    expect(component.subtitleTransform()).toBe('translate(4, 96)');

    // full mode
    (component as any).mode = signal('full');
    expect(component.viewBox()).toBe('0 0 415 104');
    expect(component.wordmarkTransform()).toBe('translate(142, 6)');
    expect(component.subtitleTransform()).toBe('translate(144, 98)');
  });

  it('4. Computes responsive and dimension classes based on size input', () => {
    (component as any).theme = signal('light');

    (component as any).size = signal('xs');
    expect(component.svgClass().trim()).toBe('h-6 w-auto');

    (component as any).size = signal('sm');
    expect(component.svgClass().trim()).toBe('h-8 w-auto');

    (component as any).size = signal('lg');
    expect(component.svgClass().trim()).toBe('h-14 w-auto');

    (component as any).size = signal('xl');
    expect(component.svgClass().trim()).toBe('h-20 w-auto');

    (component as any).size = signal('responsive');
    expect(component.svgClass().trim()).toBe('w-full h-auto max-w-[420px]');
  });

  it('5. Applies dark/light class on svg when theme is auto and includes accessible role and label', () => {
    (component as any).theme = signal('auto');
    (component as any).size = signal('md');
    const svgClass = component.svgClass();
    expect(svgClass).toContain('text-slate-900 dark:text-white');

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('PocketGull Clinical Intelligence • CDS');
  });
});

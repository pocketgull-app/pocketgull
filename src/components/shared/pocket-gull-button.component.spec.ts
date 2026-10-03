import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketGullButtonComponent } from './pocket-gull-button.component';
import { signal } from '@angular/core';

describe('PocketGullButtonComponent', () => {
  let component: PocketGullButtonComponent;
  let fixture: ComponentFixture<PocketGullButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketGullButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketGullButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default inputs and buttonClasses', () => {
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('primary');
    expect(component.size()).toBe('md');
    expect(component.disabled()).toBe(false);
    expect(component.loading()).toBe(false);
    expect(component.type()).toBe('button');

    const classes = component.buttonClasses();
    expect(classes).toContain('btn-base');
    expect(classes).toContain('btn-primary');
    expect(classes).toContain('size-md');
    expect(classes).toContain('icon-only');
  });

  it('2. Computes correct button classes for various variants and sizes', () => {
    (component as any).variant = signal('danger');
    (component as any).size = signal('lg');
    (component as any).disabled = signal(true);
    component.hasContent.set(true);

    const classes = component.buttonClasses();
    expect(classes).toContain('btn-danger');
    expect(classes).toContain('size-lg');
    expect(classes).toContain('disabled');
    expect(classes).not.toContain('icon-only');
  });

  it('3. Emits clicked output event on onClick when enabled and not loading', () => {
    let emittedEvent: MouseEvent | null = null;
    component.clicked.subscribe((e) => {
      emittedEvent = e;
    });

    const fakeEvent = new MouseEvent('click');
    component.onClick(fakeEvent);
    expect(emittedEvent).toBe(fakeEvent);
  });

  it('4. Suppresses clicked output event when disabled or loading', () => {
    let clickCount = 0;
    component.clicked.subscribe(() => {
      clickCount++;
    });

    (component as any).disabled = signal(true);
    component.onClick(new MouseEvent('click'));
    expect(clickCount).toBe(0);

    (component as any).disabled = signal(false);
    (component as any).loading = signal(true);
    component.onClick(new MouseEvent('click'));
    expect(clickCount).toBe(0);
  });

  it('5. Controls loading state and prevents click execution', () => {
    (component as any).loading = signal(true);
    expect(component.loading()).toBe(true);

    let clickEmitted = false;
    component.clicked.subscribe(() => {
      clickEmitted = true;
    });

    component.onClick(new MouseEvent('click'));
    expect(clickEmitted).toBe(false);
  });

  it('6. Sanitizes and wraps SVG icon and trailingIcon', () => {
    (component as any).icon = signal('M12 2L2 7l10 5 10-5-10-5z');
    (component as any).trailingIcon = signal('<svg><circle cx="12" cy="12" r="10"/></svg>');
    fixture.detectChanges();

    expect(component.iconHtml()).toBeTruthy();
    expect(component.trailingIconHtml()).toBeTruthy();
  });

  it('7. Detects text content in ngAfterContentChecked and updates hasContent', () => {
    expect(component.hasContent()).toBe(false);

    component.contentWrapper = {
      nativeElement: {
        textContent: '  Deploy Application  '
      }
    } as any;

    component.ngAfterContentChecked();
    expect(component.hasContent()).toBe(true);

    component.contentWrapper = {
      nativeElement: {
        textContent: '   '
      }
    } as any;

    component.ngAfterContentChecked();
    expect(component.hasContent()).toBe(false);
  });
});

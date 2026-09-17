import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsaFooterComponent } from './usa-footer.component';

describe('UsaFooterComponent Suite', () => {
  let component: UsaFooterComponent;
  let fixture: ComponentFixture<UsaFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsaFooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsaFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes cleanly with statutory links and 988 Veterans Crisis Line', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Veterans Crisis Line');
    expect(compiled.textContent).toContain('Section 508 Accessibility Statement');
  });
});

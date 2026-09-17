import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsaBannerComponent } from './usa-banner.component';

describe('UsaBannerComponent Suite', () => {
  let component: UsaBannerComponent;
  let fixture: ComponentFixture<UsaBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsaBannerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsaBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes closed by default with official government branding', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });

  it('2. Toggles open and closed state when button clicked', () => {
    component.toggleBanner();
    expect(component.isOpen()).toBe(true);

    component.toggleBanner();
    expect(component.isOpen()).toBe(false);
  });
});

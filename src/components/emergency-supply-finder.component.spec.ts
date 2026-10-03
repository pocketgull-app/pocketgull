import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmergencySupplyFinderComponent } from './emergency-supply-finder.component';

describe('EmergencySupplyFinderComponent', () => {
  let component: EmergencySupplyFinderComponent;
  let fixture: ComponentFixture<EmergencySupplyFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencySupplyFinderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencySupplyFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component with all items loaded', () => {
    expect(component).toBeTruthy();
    expect(component.activeCategory()).toBe('all');
    expect(component.items().length).toBe(5);
    expect(component.filteredItems().length).toBe(5);
    expect(component.copiedGps()).toBe(false);
  });

  it('should render header with radar title, GPS badge, and copy button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Emergency Supply & Facility Geolocation Radar');
    expect(compiled.textContent).toContain('GPS Locked');
    expect(compiled.textContent).toContain('Copy GPS: 44.0978° N, -70.2172° W');
  });

  it('should render all category filter buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('All (5)');
    expect(compiled.textContent).toContain('AED Defibrillator');
    expect(compiled.textContent).toContain('Orange Juice / Glucose');
    expect(compiled.textContent).toContain('Advil / First Aid');
    expect(compiled.textContent).toContain('ER / Doctor Office');
    expect(compiled.textContent).toContain('Shelter / Refuge');
  });

  it('should filter items by category when category filter changes', () => {
    component.activeCategory.set('aed');
    fixture.detectChanges();
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].category).toBe('aed');
    expect(component.filteredItems()[0].name).toContain('Automated External Defibrillator');

    component.activeCategory.set('medical_facility');
    fixture.detectChanges();
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].name).toContain('Hospital Emergency Room');

    component.activeCategory.set('all');
    fixture.detectChanges();
    expect(component.filteredItems().length).toBe(5);
  });

  it('should copy GPS coordinates and set copiedGps state with auto-reset', () => {
    vi.useFakeTimers();
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: clipboardSpy }
    });

    component.copyGpsCoordinates();
    expect(clipboardSpy).toHaveBeenCalledWith('Lat: 44.0978° N, Lon: -70.2172° W');
    expect(component.copiedGps()).toBe(true);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Coordinates Copied!');

    vi.advanceTimersByTime(3000);
    expect(component.copiedGps()).toBe(false);
  });

  it('should render item details with navigation map links and phone call buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Community Transit & Municipal Hub');
    expect(compiled.textContent).toContain('0.1 mi · 2 min walk');
    expect(compiled.textContent).toContain('145 Park Street, Central Station');
    expect(compiled.textContent).toContain('24/7 Public Access');

    // Check Google Maps navigation link
    const links = Array.from(compiled.querySelectorAll('a')) as HTMLAnchorElement[];
    const navLink = links.find(l => l.textContent?.includes('Navigate Now'));
    expect(navLink).toBeTruthy();
    expect(navLink?.href).toContain('google.com/maps/search');

    // Check Call button
    const callLink = links.find(l => l.textContent?.includes('Call'));
    expect(callLink).toBeTruthy();
    expect(callLink?.href).toContain('tel:');
  });

  it('should properly encode URI strings in encodeUri method', () => {
    const encoded = component.encodeUri('Emergency Room 300 Main Street');
    expect(encoded).toBe('Emergency%20Room%20300%20Main%20Street');
  });
});

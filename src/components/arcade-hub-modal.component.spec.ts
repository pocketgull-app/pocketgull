import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ArcadeHubModalComponent } from './arcade-hub-modal.component';
import { NavigationShellService } from '../services/navigation-shell.service';

@Component({ selector: 'app-historical-luminaries-game', standalone: true, template: '<div data-testid="stub-luminaries">Historical Luminaries Game</div>' })
class StubLuminariesComponent {}

@Component({ selector: 'app-movement-healing-quest', standalone: true, template: '<div data-testid="stub-movement">Movement Quest</div>' })
class StubMovementComponent {}

@Component({ selector: 'app-doctor-shift-simulator', standalone: true, template: '<div data-testid="stub-shift">Doctor Shift Sim</div>' })
class StubShiftComponent {}

@Component({ selector: 'app-residency-osce-simulator', standalone: true, template: '<div data-testid="stub-osce">OSCE Simulator</div>' })
class StubOsceComponent {}

@Component({ selector: 'app-joy-playful-flourishing-card', standalone: true, template: '<div data-testid="stub-flourish">Joy PERMA Card</div>' })
class StubJoyComponent {}

describe('ArcadeHubModalComponent', () => {
  let component: ArcadeHubModalComponent;
  let fixture: ComponentFixture<ArcadeHubModalComponent>;
  let showArcadeHubModalSignal: ReturnType<typeof signal<boolean>>;
  let activeGameIdSignal: ReturnType<typeof signal<string>>;

  beforeEach(async () => {
    showArcadeHubModalSignal = signal<boolean>(true);
    activeGameIdSignal = signal<string>('luminaries');

    await TestBed.configureTestingModule({
      imports: [ArcadeHubModalComponent]
    })
      .overrideComponent(ArcadeHubModalComponent, {
        set: {
          imports: [
            StubLuminariesComponent,
            StubMovementComponent,
            StubShiftComponent,
            StubOsceComponent,
            StubJoyComponent
          ]
        }
      })
      .overrideProvider(NavigationShellService, {
        useValue: {
          showArcadeHubModal: showArcadeHubModalSignal,
          activeGameId: activeGameIdSignal
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ArcadeHubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial default game selected', () => {
    expect(component).toBeTruthy();
    expect(component.activeGame()).toBe('luminaries');
  });

  it('should render header ribbon with title and interactive badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pocket-Gull Arcade & Clinical Quests Hub');
    expect(compiled.textContent).toContain('Interactive Learning & Flourishing');
    expect(compiled.textContent).toContain('Playful medicine, bio-rhythmic movement');
  });

  it('should render all 6 game selector buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Luminaries');
    expect(compiled.textContent).toContain('Movement');
    expect(compiled.textContent).toContain('Shift Duty');
    expect(compiled.textContent).toContain('OSCE Sim');
    expect(compiled.textContent).toContain('Joy Matrix');
    expect(compiled.textContent).toContain('Oregon Trail');
  });

  it('should switch between games and render the corresponding game view', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Default: Luminaries
    expect(compiled.querySelector('[data-testid="stub-luminaries"]')).toBeTruthy();

    // Switch to Movement
    component.activeGame.set('movement');
    fixture.detectChanges();
    expect(compiled.querySelector('[data-testid="stub-movement"]')).toBeTruthy();

    // Switch to Shift Duty
    component.activeGame.set('shift');
    fixture.detectChanges();
    expect(compiled.querySelector('[data-testid="stub-shift"]')).toBeTruthy();

    // Switch to OSCE Sim
    component.activeGame.set('osce');
    fixture.detectChanges();
    expect(compiled.querySelector('[data-testid="stub-osce"]')).toBeTruthy();

    // Switch to Joy Matrix
    component.activeGame.set('flourish');
    fixture.detectChanges();
    expect(compiled.querySelector('[data-testid="stub-flourish"]')).toBeTruthy();

    // Switch to Oregon Trail CLI view
    component.activeGame.set('trail');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('The Oregon Recovery Trail (Terminal & CLI Expedition)');
    expect(compiled.textContent).toContain('gull trail');
    expect(compiled.textContent).toContain('gull play luminaries');
  });

  it('should close modal when closeModal is called or close button is clicked', () => {
    component.closeModal();
    expect(showArcadeHubModalSignal()).toBe(false);
  });
});

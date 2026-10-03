import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SovereignGuildCommonsCardComponent } from './sovereign-guild-commons-card.component';
import { SovereignGuildCommonsService } from '../../services/sovereign-guild-commons.service';

describe('SovereignGuildCommonsCardComponent', () => {
  let component: SovereignGuildCommonsCardComponent;
  let fixture: ComponentFixture<SovereignGuildCommonsCardComponent>;

  beforeEach(async () => {
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    }

    await TestBed.configureTestingModule({
      imports: [SovereignGuildCommonsCardComponent],
      providers: [SovereignGuildCommonsService]
    }).compileComponents();

    fixture = TestBed.createComponent(SovereignGuildCommonsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component with default ostrom tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('ostrom');
    expect(component.guildService.commonsResilienceIndex()).toBeGreaterThan(0);
  });

  it('should render header with title and Ostrom 8 Invariants badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sovereign Guild & Commons Governance');
    expect(compiled.textContent).toContain('Ostrom 8 Invariants');
    expect(compiled.textContent).toContain('Elinor Ostrom');
  });

  it('should display the Ostrom Diagnostic tab with resilience score and 8 principles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Commons Resilience & Anti-Enclosure Health');
    expect(compiled.textContent).toContain('Immunity to Hardin\'s Tragedy');

    const principles = component.guildService.ostromPrinciples();
    expect(principles.length).toBe(8);
    expect(compiled.textContent).toContain('1. Clearly Defined Boundaries');
    expect(compiled.textContent).toContain('Hardin Myth Disproved:');
  });

  it('should switch to School & Land Defense tab and render anti-enclosure playbook', () => {
    component.activeTab.set('defense');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('predatory finance or municipal austerity shuts down public schools');
    expect(compiled.textContent).toContain('Step 1:');
    expect(compiled.textContent).toContain('Community Counter-Move:');

    const playbook = component.guildService.antiEnclosurePlaybook;
    expect(playbook.length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain(playbook[0].threatVector);
  });

  it('should switch to Guild Apprenticeships curriculum tab and render modules', () => {
    component.activeTab.set('curriculum');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The "Invisible College" curriculum');

    const modules = component.guildService.guildModules;
    expect(modules.length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain(modules[0].title);
    expect(compiled.textContent).toContain('Offline Kit:');
    expect(compiled.textContent).toContain('Capstone:');
  });

  it('should generate and download the Ostrom Commons Charter markdown file', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-charter');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.downloadCharter();

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-charter');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GullSquadronShowcaseComponent } from './gull-squadron-showcase.component';
import { AGENT_PERSONAS } from '../services/agent-personas';

describe('GullSquadronShowcaseComponent', () => {
  let component: GullSquadronShowcaseComponent;
  let fixture: ComponentFixture<GullSquadronShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GullSquadronShowcaseComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GullSquadronShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Gull Squadron header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('The Gull Squadron — Avian Agent Personas');
    expect(el.textContent).toContain('ADK Orchestrator');
  });

  it('2. Loads all agent persona keys and gets personas', () => {
    expect(component.personaKeys.length).toBe(Object.keys(AGENT_PERSONAS).length);
    const gulliver = component.getPersona('gulliver');
    expect(gulliver).toBeDefined();
    expect(gulliver.name).toBe(AGENT_PERSONAS['gulliver'].name);
  });

  it('3. Selects agent persona and toggles selection on re-click', () => {
    expect(component.selectedAgent()).toBe('gulliver');
    expect(component.activePersona()?.name).toBe(AGENT_PERSONAS['gulliver'].name);

    // Clicking same agent deselects
    component.selectAgent('gulliver');
    expect(component.selectedAgent()).toBeNull();
    expect(component.activePersona()).toBeNull();

    // Selecting a different agent
    const otherKey = component.personaKeys.find(k => k !== 'gulliver') || 'swoop';
    component.selectAgent(otherKey);
    expect(component.selectedAgent()).toBe(otherKey);
    expect(component.activePersona()?.name).toBe(AGENT_PERSONAS[otherKey].name);
  });

  it('4. Renders active persona detail sheet with signature props', () => {
    component.selectedAgent.set('gulliver');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Anthropomorphic Diagnostic Talent');
    expect(el.textContent).toContain('Signature Props');
    for (const prop of AGENT_PERSONAS['gulliver'].props) {
      expect(el.textContent).toContain(prop);
    }
  });

  it('5. Closes active detail sheet when close action is triggered', () => {
    component.selectedAgent.set('gulliver');
    fixture.detectChanges();

    component.selectAgent('gulliver');
    expect(component.selectedAgent()).toBeNull();
  });
});

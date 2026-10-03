import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamilyTreePedigreeComponent } from './family-tree-pedigree.component';

describe('FamilyTreePedigreeComponent', () => {
  let component: FamilyTreePedigreeComponent;
  let fixture: ComponentFixture<FamilyTreePedigreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyTreePedigreeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyTreePedigreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default family members across three generations', () => {
    expect(component).toBeTruthy();
    expect(component.members().length).toBe(5);
    expect(component.selectedMember()).toBe(component.members()[0]);
    expect(component.selectedMember()?.id).toBe('g_mat_gf');
  });

  it('2. Filters members by generation (grandparents, parents, offspring)', () => {
    const grandparents = component.getMembersByGen('grandparents');
    expect(grandparents.length).toBe(2);
    expect(grandparents.every(m => m.generation === 'grandparents')).toBe(true);

    const parents = component.getMembersByGen('parents');
    expect(parents.length).toBe(2);
    expect(parents.every(m => m.generation === 'parents')).toBe(true);

    const offspring = component.getMembersByGen('offspring');
    expect(offspring.length).toBe(1);
    expect(offspring[0].relation).toContain('Offspring');
  });

  it('3. Selects a family member and updates selectedMember', () => {
    const mother = component.members().find(m => m.id === 'p_mother')!;
    component.selectMember(mother);
    expect(component.selectedMember()?.id).toBe('p_mother');
    expect(component.selectedMember()?.riskLabel).toContain('MTHFR');
  });

  it('4. Neutralizes a risk branch and updates member status in state and selected view', () => {
    expect(component.selectedMember()?.status).toBe('active_risk');

    component.neutralizeBranch('g_mat_gf');
    expect(component.selectedMember()?.status).toBe('neutralized');

    const updatedMember = component.members().find(m => m.id === 'g_mat_gf');
    expect(updatedMember?.status).toBe('neutralized');
  });

  it('5. Formats status badge class and status text correctly', () => {
    expect(component.getStatusText('active_risk')).toBe('Active Risk');
    expect(component.getStatusText('neutralized')).toBe('Neutralized');
    expect(component.getStatusText('optimal')).toBe('Protected');

    expect(component.getStatusBadgeClass('active_risk')).toContain('text-orange-400');
    expect(component.getStatusBadgeClass('neutralized')).toContain('text-zinc-300');
    expect(component.getStatusBadgeClass('optimal')).toContain('text-emerald-400');
  });

  it('6. Emits closeModal output event when triggered', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});

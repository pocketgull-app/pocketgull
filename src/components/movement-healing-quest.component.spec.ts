import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovementHealingQuestComponent } from './movement-healing-quest.component';
import { MovementHealingQuestService } from '../services/movement-healing-quest.service';

describe('MovementHealingQuestComponent', () => {
  let component: MovementHealingQuestComponent;
  let fixture: ComponentFixture<MovementHealingQuestComponent>;
  let questService: MovementHealingQuestService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementHealingQuestComponent],
      providers: [MovementHealingQuestService]
    }).compileComponents();

    fixture = TestBed.createComponent(MovementHealingQuestComponent);
    component = fixture.componentInstance;
    questService = TestBed.inject(MovementHealingQuestService);
    fixture.detectChanges();
  });

  it('1. Initializes Quest Component with default title and 0% progress', () => {
    expect(component).toBeTruthy();
    expect(component.quest().title).toContain('Vagal Odyssey');
    expect(component.progressPct()).toBe(0);
    expect(component.currentPoints()).toBe(0);
  });

  it('2. Switches platform to Apple iPhone / Watch', () => {
    component.setPlatform('APPLE_IOS');
    expect(questService.activePlatform()).toBe('APPLE_IOS');
  });

  it('3. Completes milestone through UI and updates points', () => {
    component.completeMilestone('m-1');
    fixture.detectChanges();

    expect(component.currentPoints()).toBe(40);
    expect(component.progressPct()).toBe(33);
  });

  it('4. Resets quest state cleanly', () => {
    component.completeMilestone('m-1');
    expect(component.currentPoints()).toBe(40);

    component.resetQuest();
    expect(component.currentPoints()).toBe(0);
    expect(component.progressPct()).toBe(0);
  });
});

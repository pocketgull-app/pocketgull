import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NantucketPassportStorybookComponent } from './nantucket-passport-storybook.component';
import { NantucketTickRadarService } from '../services/nantucket-tick-radar.service';

describe('NantucketPassportStorybookComponent - Beatrix Potter Storybook Suite', () => {
  let component: NantucketPassportStorybookComponent;
  let fixture: ComponentFixture<NantucketPassportStorybookComponent>;
  let radarService: NantucketTickRadarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NantucketPassportStorybookComponent],
      providers: [NantucketTickRadarService]
    }).compileComponents();

    fixture = TestBed.createComponent(NantucketPassportStorybookComponent);
    component = fixture.componentInstance;
    radarService = TestBed.inject(NantucketTickRadarService);
    fixture.detectChanges();
  });

  it('1. Initializes with 7 Beatrix Potter coastal botanical stamp zones', () => {
    expect(component.stampZones().length).toBe(7);
    expect(component.completedStampsCount()).toBe(0);
    expect(component.isFullyCompleted()).toBe(false);
  });

  it('2. Toggles stamp state on user interaction and increments progress', () => {
    component.toggleStamp('zone_head');
    expect(component.isStamped('zone_head')).toBe(true);
    expect(component.completedStampsCount()).toBe(1);

    component.toggleStamp('zone_head');
    expect(component.isStamped('zone_head')).toBe(false);
    expect(component.completedStampsCount()).toBe(0);
  });

  it('3. Completes all 7 stamps and unlocks Junior Naturalist Seal', () => {
    component.stampAllZones();
    expect(component.completedStampsCount()).toBe(7);
    expect(component.isFullyCompleted()).toBe(true);
  });

  it('4. Resets passport stamps cleanly', () => {
    component.stampAllZones();
    expect(component.isFullyCompleted()).toBe(true);

    component.resetPassport();
    expect(component.completedStampsCount()).toBe(0);
    expect(component.isFullyCompleted()).toBe(false);
  });

  it('5. Renders printable explorer passport and trail selector', () => {
    component.detectiveName.set('Scout');
    component.selectedTrail.set('Sanford Farm & Ram Pasture');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Junior Island Detective Field Passport');
    expect(compiled.textContent).toContain('Sweet Bayberry');
    expect(compiled.textContent).toContain('Sanford Farm');
  });
});

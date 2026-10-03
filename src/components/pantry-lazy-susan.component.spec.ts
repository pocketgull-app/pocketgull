import '@angular/compiler';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PantryLazySusanComponent } from './pantry-lazy-susan.component';
import { IClinicalMenuItem } from './clinical-menu.component';

describe('PantryLazySusanComponent Unit Suite', () => {
  let component: PantryLazySusanComponent;

  const mockItems: IClinicalMenuItem[] = [
    {
      id: 'soup-1',
      emoji: '🍲',
      name: 'Ginger Broth',
      category: 'Starter',
      description: 'Warming ginger bone broth',
      tcmEnergetics: 'Warming',
      ayurvedicDosha: 'Vata Pacifying',
      glycemicIndex: 15,
      activeCompounds: [{ name: 'Gingerol', dose: '10mg' }],
      clinicalRationale: 'Stimulates digestive fire',
      ramsDesignPrinciple: 'Good design is unobtrusive',
      targetConditions: ['Dyspepsia']
    },
    {
      id: 'salad-2',
      emoji: '🥗',
      name: 'Bitter Greens',
      category: 'Starter',
      description: 'Dandelion and arugula salad',
      tcmEnergetics: 'Cooling',
      ayurvedicDosha: 'Pitta Pacifying',
      glycemicIndex: 10,
      activeCompounds: [{ name: 'Taraxacin', dose: '50mg' }],
      clinicalRationale: 'Promotes bile secretion',
      ramsDesignPrinciple: 'Good design is honest',
      targetConditions: ['Hepatic sluggishness']
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantryLazySusanComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PantryLazySusanComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully with default signals', () => {
    expect(component).toBeTruthy();
    expect(component.webglSupported()).toBe(true);
    expect(component.currentAngle()).toBe(0);
    expect(component.items().length).toBe(0);
    expect(component.selectedItem()).toBeNull();
  });

  it('2. Receives items input and handles turntable rotation', () => {
    (component as any).items = () => mockItems;

    expect(component.items().length).toBe(2);
    expect(component.items()[0].name).toBe('Ginger Broth');
  });

  it('3. Emits itemSelect on selectItemByAngle', () => {
    let emittedItem: IClinicalMenuItem | undefined;
    component.itemSelect.subscribe((item: IClinicalMenuItem) => {
      emittedItem = item;
    });

    component.selectItemByAngle(1, mockItems[1]);
    expect(emittedItem).toBeDefined();
    expect(emittedItem?.id).toBe('salad-2');
  });

  it('4. Emits itemSelect on rotateTurntable when items are populated', () => {
    (component as any).items = () => mockItems;

    let emittedItem: IClinicalMenuItem | undefined;
    component.itemSelect.subscribe((item: IClinicalMenuItem) => {
      emittedItem = item;
    });

    component.rotateTurntable(90);
    expect(emittedItem).toBeDefined();
  });

  it('5. Safe cleanup on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});

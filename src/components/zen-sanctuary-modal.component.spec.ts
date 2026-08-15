import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ZenSanctuaryModalComponent } from './zen-sanctuary-modal.component';
import { ZenSanctuaryService } from '../services/zen-sanctuary.service';

describe('ZenSanctuaryModalComponent Unit Suite', () => {
  let component: ZenSanctuaryModalComponent;
  let fixture: ComponentFixture<ZenSanctuaryModalComponent>;
  let zenService: ZenSanctuaryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZenSanctuaryModalComponent],
      providers: [ZenSanctuaryService]
    }).compileComponents();

    fixture = TestBed.createComponent(ZenSanctuaryModalComponent);
    component = fixture.componentInstance;
    zenService = TestBed.inject(ZenSanctuaryService);
  });

  it('1. Does not render modal when inactive', () => {
    zenService.closeSanctuary();
    fixture.detectChanges();
    const modalEl = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(modalEl).toBeNull();
  });

  it('2. Renders sanctuary modal when active', () => {
    zenService.openSanctuary();
    fixture.detectChanges();
    const modalEl = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(modalEl).not.toBeNull();
  });

  it('3. Submits a new postcard successfully', () => {
    component.newLocation = 'Big Sur, CA';
    component.newTopic = 'Ocean Breath';
    component.newMessage = 'Watching the fog roll over the pines.';

    component.submitPostcard();

    const postcards = zenService.postcards();
    expect(postcards[0].senderLocation).toBe('Big Sur, CA');
    expect(component.isComposing()).toBe(false);
  });
});

import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsaHeaderComponent } from './usa-header.component';

describe('UsaHeaderComponent Suite', () => {
  let component: UsaHeaderComponent;
  let fixture: ComponentFixture<UsaHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsaHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsaHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default care-plan active tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('care-plan');
  });

  it('2. Emits tabChange and closePortal outputs', () => {
    let selectedTab = '';
    component.tabChange.subscribe((tab) => {
      selectedTab = tab;
    });
    component.tabChange.emit('fhir');
    expect(selectedTab).toBe('fhir');

    let closed = false;
    component.closePortal.subscribe(() => {
      closed = true;
    });
    component.closePortal.emit();
    expect(closed).toBe(true);
  });
});

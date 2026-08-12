import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartFhirLauncherComponent } from './smart-fhir-launcher.component';
import { SmartOnFhirLauncherService } from '../services/fhir/smart-on-fhir-launcher.service';

describe('SmartFhirLauncherComponent', () => {
  let component: SmartFhirLauncherComponent;
  let fixture: ComponentFixture<SmartFhirLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartFhirLauncherComponent],
      providers: [SmartOnFhirLauncherService]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartFhirLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render SMART vendor cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.bg-zinc-900\\/80').length).toBeGreaterThanOrEqual(4);
  });
});

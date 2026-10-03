import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiezoMechanoreceptorMatrixComponent } from './piezo-mechanoreceptor-matrix.component';

describe('PiezoMechanoreceptorMatrixComponent', () => {
  let fixture: ComponentFixture<PiezoMechanoreceptorMatrixComponent>;
  let component: PiezoMechanoreceptorMatrixComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiezoMechanoreceptorMatrixComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PiezoMechanoreceptorMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, Julius model, and prize attribution', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PIEZO1/2 & TRPV1 Mechanosensory Matrix');
    expect(el.textContent).toContain('Julius Model');
    expect(el.textContent).toContain('Lasker & Breakthrough Prize');
    expect(el.textContent).toContain('Ion Channel');
  });

  it('2. Contains 4 canonical mechanosensory & thermo-sensory ion channels', () => {
    expect(component.channels.length).toBe(4);
    const names = component.channels.map(c => c.channel);
    expect(names).toEqual(['PIEZO1', 'PIEZO2', 'TRPV1', 'TRPM8']);
  });

  it('3. Renders channel names and stimuli in DOM', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PIEZO1');
    expect(el.textContent).toContain('Vascular Fluid Shear Stress');
    expect(el.textContent).toContain('PIEZO2');
    expect(el.textContent).toContain('Tactile Touch & Proprioception');
    expect(el.textContent).toContain('TRPV1');
    expect(el.textContent).toContain('Noxious Heat (>43°C) & Capsaicin');
    expect(el.textContent).toContain('TRPM8');
    expect(el.textContent).toContain('Cooling Temperatures & Menthol');
  });

  it('4. Renders anatomical locations and physiological roles', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Endothelial Blood Vessels');
    expect(el.textContent).toContain('Merkel Discs & Joint Capsule');
    expect(el.textContent).toContain('Nociceptive C-Fibers');
    expect(el.textContent).toContain('A-delta Sensory Fibers');
    expect(el.textContent).toContain('Senses arterial blood pressure');
    expect(el.textContent).toContain('Senses body position in 3D space');
  });

  it('5. Renders footer bar with Kavli Prize and Cationic Influx Transduction', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Kavli Prize & Breakthrough Prize in Life Sciences');
    expect(el.textContent).toContain('Cationic Influx Transduction');
  });
});

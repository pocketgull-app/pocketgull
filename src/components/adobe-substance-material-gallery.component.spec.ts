import '@angular/compiler';
import { AdobeSubstanceMaterialGalleryComponent } from './adobe-substance-material-gallery.component';
import { AdobeEnterpriseSuiteService } from '../services/adobe-enterprise-suite.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AdobeSubstanceMaterialGalleryComponent', () => {
  let component: AdobeSubstanceMaterialGalleryComponent;
  let adobeSuite: AdobeEnterpriseSuiteService;

  beforeEach(() => {
    adobeSuite = new AdobeEnterpriseSuiteService();
    const injector = Injector.create({
      providers: [
        { provide: AdobeEnterpriseSuiteService, useValue: adobeSuite }
      ]
    });

    component = runInInjectionContext(injector, () => new AdobeSubstanceMaterialGalleryComponent());
  });

  it('should initialize with 5 Substance 3D biophysical materials', () => {
    expect(component).toBeTruthy();
    expect(component.materials().length).toBe(5);
    expect(component.selectedMaterial().category).toBe('osteology');
  });

  it('should switch selected material correctly', () => {
    const dentalMat = component.materials().find(m => m.category === 'dental')!;
    component.selectMaterial(dentalMat);

    expect(component.selectedMaterial().id).toBe('substance-hydroxyapatite-enamel');
    expect(component.selectedMaterial().pbr.roughness).toBe(0.12);
  });

  it('should apply selected PBR substrate to WebGL viewer with notice', () => {
    const vascularMat = component.materials().find(m => m.category === 'vascular')!;
    component.selectMaterial(vascularMat);
    component.applyToWebGLViewer();

    expect(component.appliedNotice()).toContain('Applied Endothelial Microvascular Perfusion Substrate');
    expect(component.appliedNotice()).toContain('Three.js WebGL');
  });
});

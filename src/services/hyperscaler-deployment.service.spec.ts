import { TestBed } from '@angular/core/testing';
import { HyperscalerDeploymentService } from './hyperscaler-deployment.service';

describe('HyperscalerDeploymentService', () => {
  let service: HyperscalerDeploymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HyperscalerDeploymentService);
  });

  it('1. Default provider is GCP with scale to 0 configuration', () => {
    const config = service.selectedConfig();
    expect(config.vendor).toContain('Google Cloud Platform');
    expect(config.autoScalingMinNodes).toBe(0);
    expect(config.complianceCertifications).toContain('HIPAA BAA');
  });

  it('2. Switches active cloud provider to AWS', () => {
    service.setActiveProvider('Amazon Web Services (AWS)');
    const config = service.selectedConfig();
    expect(config.vendor).toContain('AWS');
    expect(config.fhirEndpoint).toContain('healthlake');
  });

  it('3. Generates enterprise Helm chart values for hyperscaler deployment', () => {
    const helm = service.generateHelmChartYaml('Microsoft Azure');
    expect(helm).toContain('Target Cloud Provider: Microsoft Azure');
    expect(helm).toContain('POCKETGULL_HIPAA_MODE: "ENFORCED"');
  });
});

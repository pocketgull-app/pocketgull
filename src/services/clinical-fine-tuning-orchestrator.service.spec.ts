import { ClinicalFineTuningOrchestratorService } from './clinical-fine-tuning-orchestrator.service';

describe('ClinicalFineTuningOrchestratorService Suite', () => {
  let service: ClinicalFineTuningOrchestratorService;

  beforeEach(() => {
    service = new ClinicalFineTuningOrchestratorService();
  });

  it('should initialize with all 11 clinical and domain fine-tuning paradigms', () => {
    expect(service).toBeTruthy();
    expect(service.totalParadigms()).toBe(11);
    expect(service.paradigms().length).toBe(11);
  });

  it('should have default selected paradigm as dpo_epistemic_grounding', () => {
    expect(service.selectedParadigmId()).toBe('dpo_epistemic_grounding');
    expect(service.activeParadigm().name).toContain('DPO Epistemic Grounding');
    expect(service.activeParadigm().defaultTrainer).toBe('DPO');
  });

  it('should support pocketgull.com SEO medical journalism paradigm', () => {
    service.selectParadigm('seo_medical_journalism');
    expect(service.selectedParadigmId()).toBe('seo_medical_journalism');
    expect(service.activeParadigm().targetDomain).toBe('pocketgull.com');
    expect(service.activeParadigm().category).toBe('Medical Journalism');
  });

  it('should support pocketgull.app live multimodal voice consult paradigm', () => {
    service.selectParadigm('voice_multimodal_live');
    expect(service.selectedParadigmId()).toBe('voice_multimodal_live');
    expect(service.activeParadigm().targetDomain).toBe('pocketgull.app');
    expect(service.activeParadigm().quantizationTarget).toContain('Q4_K_M');
  });

  it('should generate valid CLI command for training with appropriate flags', () => {
    const dpoCmd = service.generateCliCommand('dpo_epistemic_grounding');
    expect(dpoCmd).toContain('--paradigm dpo_epistemic_grounding');
    expect(dpoCmd).toContain('--trainer_type dpo');

    const edgeCmd = service.generateCliCommand('ambient_scribe_soap');
    expect(edgeCmd).toContain('--paradigm ambient_scribe_soap');
    expect(edgeCmd).toContain('--export_gguf q4_k_m');
  });

  it('should generate valid Vertex AI Model Garden upload, deploy, and model card manifests', () => {
    const uploadCmd = service.generateVertexModelGardenUploadCommand('pharmacogenomics_pgx');
    expect(uploadCmd).toContain('gcloud ai models upload');
    expect(uploadCmd).toContain('--project=gen-lang-client-0540208645');
    expect(uploadCmd).toContain('pocketgull-pharmacogenomics-pgx-gemma3-lora');

    const deployCmd = service.generateVertexEndpointDeployCommand('pharmacogenomics_pgx');
    expect(deployCmd).toContain('gcloud ai endpoints deploy-model');
    expect(deployCmd).toContain('--min-replica-count=0');

    const modelCard = service.generateVertexModelCardYaml('pharmacogenomics_pgx');
    expect(modelCard).toContain('GEARARTS / PocketGull Clinical Intelligence');
    expect(modelCard).toContain('zenodo_doi: "10.5281/zenodo.20647514"');
    expect(modelCard).toContain('npi: "1487569752"');
  });
});

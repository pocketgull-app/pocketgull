import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AwsOpenDataBrowserComponent } from './aws-open-data-browser.component';
import { AwsOpenDataService, IOpenHealthDataset } from '../../services/aws-open-data.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AwsOpenDataBrowserComponent', () => {
  let component: AwsOpenDataBrowserComponent;
  let fixture: ComponentFixture<AwsOpenDataBrowserComponent>;
  let service: AwsOpenDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwsOpenDataBrowserComponent],
      providers: [AwsOpenDataService],
    }).compileComponents();

    fixture = TestBed.createComponent(AwsOpenDataBrowserComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(AwsOpenDataService);
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
    expect(component.categories.length).toBeGreaterThan(5);
  });

  it('should update search query via onSearchInput', () => {
    const inputEvent = { target: { value: 'oncology' } } as unknown as Event;
    component.onSearchInput(inputEvent);
    expect(service.searchQuery()).toBe('oncology');
  });

  it('should copy SQL query and toggle copied state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const sampleSql = 'SELECT * FROM `bigquery-public-data.nih_clinical_trials.clinical_study_block` LIMIT 10';
    await component.copySql(sampleSql);

    expect(writeTextMock).toHaveBeenCalledWith(sampleSql);
    expect(component.copiedSql()).toBe(true);
  });

  it('should render BigQuery SQL block in modal when selected dataset has sampleBigQuerySql', () => {
    const bqDataset: IOpenHealthDataset = {
      id: 'test-bq-nih',
      name: 'NIH Clinical Trials BigQuery',
      provider: 'gcp',
      providerLabel: 'Google Cloud BigQuery',
      category: 'clinical',
      description: 'NIH Clinical Trials on BigQuery',
      storageUri: 'bigquery-public-data.nih_clinical_trials',
      regionOrLocation: 'US Multi-Region',
      managedBy: 'NIH / Google Cloud Public Datasets',
      license: 'Public Domain / Open Data',
      queryOrAccessMethod: 'BigQuery Public',
      tags: ['clinical-trials', 'nih', 'bigquery'],
      documentationUrl: 'https://cloud.google.com/bigquery',
      sampleBigQuerySql: 'SELECT nct_id, brief_title FROM `bigquery-public-data.nih_clinical_trials.clinical_study_block` LIMIT 5',
    };

    service.selectDataset(bqDataset);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('BigQuery Standard SQL Template');
    expect(compiled.textContent).toContain('Copy SQL');
    expect(compiled.textContent).toContain('SELECT nct_id, brief_title');
  });

  it('should clear selected dataset on close', () => {
    const mockDataset: IOpenHealthDataset = {
      id: 'test-dataset',
      name: 'Test Dataset',
      provider: 'gcp',
      providerLabel: 'Google Cloud',
      category: 'genomics',
      description: 'Testing modal close',
      storageUri: 'gs://test-bucket',
      regionOrLocation: 'US',
      managedBy: 'Test Team',
      license: 'MIT',
      queryOrAccessMethod: 'HTTPS REST',
      tags: ['test'],
      documentationUrl: 'https://example.com',
    };

    service.selectDataset(mockDataset);
    fixture.detectChanges();
    expect(service.selectedDataset()).not.toBeNull();

    service.selectDataset(null);
    fixture.detectChanges();
    expect(service.selectedDataset()).toBeNull();
  });
});

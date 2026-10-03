import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractHubComponent } from './contract-hub.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ContractHubComponent', () => {
  let component: ContractHubComponent;
  let fixture: ComponentFixture<ContractHubComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractHubComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ContractHubComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('1. Initializes and loads templates from API', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/contracts/templates');
    expect(req.request.method).toBe('GET');

    req.flush([
      {
        id: 'tmpl-baa',
        name: 'HIPAA Business Associate Agreement (BAA)',
        description: 'Standard institutional BAA contract with Safe Harbor data protection clauses.'
      },
      {
        id: 'tmpl-nda',
        name: 'Mutual Non-Disclosure Agreement (NDA)',
        description: 'Two-way confidential disclosure framework.'
      }
    ]);

    fixture.detectChanges();

    expect(component.templates().length).toBe(2);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Enterprise Contract Hub');
    expect(el.textContent).toContain('HIPAA Business Associate Agreement (BAA)');
    expect(el.textContent).toContain('Mutual Non-Disclosure Agreement (NDA)');
  });

  it('2. Shows empty state message when no template is selected', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/contracts/templates').flush([]);

    expect(component.selectedTemplate()).toBeNull();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No template selected');
  });

  it('3. Selects a template and displays configuration form', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/contracts/templates').flush([
      {
        id: 'tmpl-baa',
        name: 'HIPAA BAA Agreement',
        description: 'Clinical compliance template.'
      }
    ]);

    component.selectedTemplate.set(component.templates()[0]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Prepare HIPAA BAA Agreement');
    expect(el.textContent).toContain('Client Name');
    expect(el.textContent).toContain('Effective Date');
    expect(el.textContent).toContain('Compensation Amount');
  });

  it('4. Prepares contract via API and updates generating state', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/contracts/templates').flush([
      {
        id: 'tmpl-baa',
        name: 'HIPAA BAA Agreement',
        description: 'Clinical compliance template.'
      }
    ]);

    component.selectedTemplate.set(component.templates()[0]);
    component.formData.CLIENT_NAME = 'Pacific Health Systems';
    component.formData.COMPENSATION_AMOUNT = '$50,000 USD';

    // Mock internal renderPdf to avoid html2canvas DOM invocation in test
    vi.spyOn(component as any, 'renderPdf').mockResolvedValue(undefined);

    component.generateContract();
    expect(component.isGenerating()).toBe(true);

    const postReq = httpTesting.expectOne('/api/contracts/prepare');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({
      templateId: 'tmpl-baa',
      variables: component.formData
    });

    postReq.flush({ html: '<html><body>BAA Contract Body</body></html>' });
    expect((component as any).renderPdf).toHaveBeenCalled();
  });

  it('5. Handles API error during contract preparation gracefully', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/contracts/templates').flush([
      {
        id: 'tmpl-baa',
        name: 'HIPAA BAA Agreement',
        description: 'Clinical compliance template.'
      }
    ]);

    component.selectedTemplate.set(component.templates()[0]);
    component.generateContract();
    expect(component.isGenerating()).toBe(true);

    const postReq = httpTesting.expectOne('/api/contracts/prepare');
    postReq.error(new ProgressEvent('Network error'));

    expect(component.isGenerating()).toBe(false);
  });
});

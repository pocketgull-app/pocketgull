import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiKeyManagerComponent } from './api-key-manager.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ApiKeyManagerComponent', () => {
  let component: ApiKeyManagerComponent;
  let fixture: ComponentFixture<ApiKeyManagerComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiKeyManagerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ApiKeyManagerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('1. Initializes and loads active API keys from backend', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/keys');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-tenant-id')).toBe('demo-tenant-123');

    req.flush([
      {
        id: 'key-1',
        name: 'Mobile Client Key',
        prefix: 'pk_live_abcd',
        createdAt: '2026-09-01T00:00:00Z',
        lastUsedAt: '2026-09-20T12:00:00Z',
        status: 'active'
      },
      {
        id: 'key-2',
        name: 'Revoked Key',
        prefix: 'pk_live_efgh',
        createdAt: '2026-08-01T00:00:00Z',
        status: 'revoked'
      }
    ]);

    fixture.detectChanges();
    expect(component.keys().length).toBe(2);
    expect(component.activeKeys().length).toBe(1);
    expect(component.activeKeys()[0].name).toBe('Mobile Client Key');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mobile Client Key');
    expect(el.textContent).toContain('pk_live_abcd');
  });

  it('2. Shows generate key form when clicking Generate New Key button', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/keys').flush([]);

    expect(component.isGenerating()).toBe(false);
    component.isGenerating.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Create new API key');
  });

  it('3. Generates a new API key and refreshes key list', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/keys').flush([]);

    component.isGenerating.set(true);
    component.newKeyName.set('Test Service Key');

    component.generateKey();
    expect(component.isLoading()).toBe(true);

    const postReq = httpTesting.expectOne('/api/keys/generate');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ name: 'Test Service Key' });
    postReq.flush({ rawKey: 'pk_live_secret123456', keyId: 'key-new' });

    // Expect reloadKeys GET call
    const reloadReq = httpTesting.expectOne('/api/keys');
    reloadReq.flush([
      {
        id: 'key-new',
        name: 'Test Service Key',
        prefix: 'pk_live_secr',
        createdAt: '2026-10-01T00:00:00Z',
        status: 'active'
      }
    ]);

    fixture.detectChanges();

    expect(component.newlyGeneratedKey()).toBe('pk_live_secret123456');
    expect(component.isGenerating()).toBe(false);
    expect(component.isLoading()).toBe(false);
    expect(component.newKeyName()).toBe('');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Please copy this key now');
    expect(el.textContent).toContain('pk_live_secret123456');
  });

  it('4. Revokes an active API key after user confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.detectChanges();
    httpTesting.expectOne('/api/keys').flush([
      {
        id: 'key-to-delete',
        name: 'Disposable Key',
        prefix: 'pk_live_disp',
        createdAt: '2026-09-01T00:00:00Z',
        status: 'active'
      }
    ]);

    component.revokeKey('key-to-delete');

    const delReq = httpTesting.expectOne('/api/keys/key-to-delete');
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({});

    const reloadReq = httpTesting.expectOne('/api/keys');
    reloadReq.flush([]);

    fixture.detectChanges();
    expect(component.activeKeys().length).toBe(0);
  });

  it('5. Correctly formats timestamp objects and ISO date strings', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/keys').flush([]);

    expect(component.formatDate(null)).toBe('');
    expect(component.formatDate('2026-01-15T00:00:00Z')).toBeTruthy();
    expect(component.formatDate({ _seconds: 1700000000, _nanoseconds: 0 })).toBeTruthy();
  });
});

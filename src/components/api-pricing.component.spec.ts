import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiPricingComponent } from './api-pricing.component';
import { HttpClient } from '@angular/common/http';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ApiPricingComponent', () => {
  let component: ApiPricingComponent;
  let mockHttpClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };
  let injector: EnvironmentInjector;

  const sampleUsageResponse = {
    tenantId: 'tenant-abc-123',
    tier: 'practitioner',
    tierLabel: 'Practitioner',
    priceMonthlyUsd: 49,
    currentMonth: '2026-08',
    usage: {
      discovery_read: 120,
      discovery_resolve: 450,
      discovery_probe: 100,
      tool_execution: 1200,
      pipeline_graph: 35
    },
    quotas: {
      discovery_read: -1,
      discovery_resolve: 1000,
      discovery_probe: 500,
      tool_execution: 5000,
      pipeline_graph: 200
    },
    remaining: {
      discovery_read: 'unlimited',
      discovery_resolve: 550,
      discovery_probe: 400,
      tool_execution: 3800,
      pipeline_graph: 165
    },
    upgradeUrl: null
  };

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn().mockReturnValue(of(sampleUsageResponse)),
      post: vi.fn().mockReturnValue(of({ url: 'https://checkout.stripe.com/pay/cs_test_123' }))
    };

    injector = createEnvironmentInjector([
      { provide: HttpClient, useValue: mockHttpClient }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ApiPricingComponent();
    });
  });

  it('should create and load usage data on initialization', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(mockHttpClient.get).toHaveBeenCalledWith('/api/keys/usage');
    expect(component.usageData()).toEqual(sampleUsageResponse);
    expect(component.currentTier()).toBe('practitioner');
    expect(component.currentTierLabel()).toBe('Practitioner');
  });

  it('should handle unauthenticated state gracefully when usage fetch fails', () => {
    mockHttpClient.get.mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.fetchUsage();
    expect(component.usageData()).toBeNull();
    expect(component.currentTier()).toBe('none');
    expect(component.currentTierLabel()).toBe('No plan');
  });

  it('should calculate usage percentage and bar colors accurately', () => {
    // Normal usage (45%)
    expect(component.getUsagePercent(450, 1000)).toBe(45);
    expect(component.getUsageBarColor(450, 1000)).toBe('bg-emerald-500');

    // Warning usage (75%)
    expect(component.getUsagePercent(750, 1000)).toBe(75);
    expect(component.getUsageBarColor(750, 1000)).toBe('bg-amber-500');

    // Critical usage (95%)
    expect(component.getUsagePercent(950, 1000)).toBe(95);
    expect(component.getUsageBarColor(950, 1000)).toBe('bg-rose-500');

    // Zero limit / unlimited
    expect(component.getUsagePercent(10, 0)).toBe(0);
    expect(component.getUsagePercent(10, -1)).toBe(0);
  });

  it('should trigger checkout request on subscribe', () => {
    component.subscribe('price_test_123', 'Practitioner');
    expect(component.isLoading()).toBe(true);
    expect(mockHttpClient.post).toHaveBeenCalledWith('/api/billing/checkout', {
      priceId: 'price_test_123',
      customerEmail: 'admin@demo-tenant.com',
      itemType: 'agentic_api_tier',
      packageName: 'Pocket Gull Practitioner API'
    });
  });

  it('should emit close event when close is triggered', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });
    component.close.emit();
    expect(emitted).toBe(true);
  });
});

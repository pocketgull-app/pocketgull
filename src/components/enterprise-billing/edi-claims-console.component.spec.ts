import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EdiClaimsConsoleComponent } from './edi-claims-console.component';
import { X12EdiClaimsService } from '../../services/x12-edi-claims.service';

describe('EdiClaimsConsoleComponent', () => {
  let component: EdiClaimsConsoleComponent;
  let fixture: ComponentFixture<EdiClaimsConsoleComponent>;
  let ediService: X12EdiClaimsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdiClaimsConsoleComponent],
      providers: [X12EdiClaimsService]
    }).compileComponents();

    fixture = TestBed.createComponent(EdiClaimsConsoleComponent);
    component = fixture.componentInstance;
    ediService = TestBed.inject(X12EdiClaimsService);
    fixture.detectChanges();
  });

  it('1. Initializes with active 837P claim and default RPM schedule', () => {
    expect(component).toBeTruthy();
    const claim = component.activeClaim();
    expect(claim).not.toBeNull();
    expect(claim!.serviceLinesCount).toBe(4);
    expect(claim!.totalChargeUsd).toBe(156);
    expect(claim!.validation.isValid).toBe(true);
    expect(claim!.validation.snipLevel).toBe('SNIP_2_REQUIREMENT');
    expect(component.activeView()).toBe('837p');
    expect(component.activeRemittance()).toBeNull();
  });

  it('2. Generates an ANSI X12 837P claim with valid structural segments', () => {
    component.generateClaim();
    fixture.detectChanges();

    const claim = component.activeClaim();
    expect(claim).not.toBeNull();
    expect(claim!.ediContent).toContain('ISA*');
    expect(claim!.ediContent).toContain('ST*837*');
    expect(claim!.ediContent).toContain('SE*');
    expect(claim!.ediContent).toContain('GE*');
    expect(claim!.ediContent).toContain('IEA*');
    expect(claim!.totalChargeUsd).toBe(156);
  });

  it('3. Simulates ANSI X12 835 Electronic Remittance Advice (ERA) against generated claim', () => {
    component.generateClaim();
    component.simulateRemittance();
    fixture.detectChanges();

    const rem = component.activeRemittance();
    expect(rem).not.toBeNull();
    expect(component.activeView()).toBe('835');
    expect(rem!.edi835Content).toContain('ST*835*');
    expect(rem!.edi835Content).toContain('BPR*I*');
    expect(rem!.totalPaidUsd).toBe(106.08);
    expect(rem!.contractualAdjustmentUsd).toBe(23.40);
    expect(rem!.patientResponsibilityUsd).toBe(26.52);
  });

  it('4. Toggles between 837P and 835 views', () => {
    component.simulateRemittance();
    expect(component.activeView()).toBe('835');

    component.activeView.set('837p');
    expect(component.activeView()).toBe('837p');
  });

  it('5. Copies active EDI payload to clipboard when copyActiveEdi is invoked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    await component.copyActiveEdi();
    expect(writeTextMock).toHaveBeenCalled();
    expect(component.copied()).toBe(true);
  });

  it('6. Emits close event when close output is triggered', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });

    component.close.emit();
    expect(emitted).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { GroundedEvidenceBadgeComponent } from './grounded-evidence-badge.component';
import { VertexAgentBuilderService } from '../services/ai/vertex-agent-builder.service';

describe('GroundedEvidenceBadgeComponent', () => {
  let component: GroundedEvidenceBadgeComponent;
  let fixture: ComponentFixture<GroundedEvidenceBadgeComponent>;
  let agentService: VertexAgentBuilderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroundedEvidenceBadgeComponent],
      providers: [
        VertexAgentBuilderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroundedEvidenceBadgeComponent);
    component = fixture.componentInstance;
    agentService = TestBed.inject(VertexAgentBuilderService);
    fixture.detectChanges();
  });

  it('should create and render initial grounding score', () => {
    expect(component).toBeTruthy();
    expect(component.displayScore()).toBe('95');
    expect(component.drawerOpen()).toBe(false);
  });

  it('should toggle citation drawer when toggleDrawer() is invoked', () => {
    expect(component.drawerOpen()).toBe(false);
    component.toggleDrawer();
    expect(component.drawerOpen()).toBe(true);
    component.toggleDrawer();
    expect(component.drawerOpen()).toBe(false);
  });

  it('should calculate correct tier badge class for Tier A evidence', () => {
    agentService.citations.set([
      {
        title: 'SPRINT Trial',
        uri: 'https://doi.org/10.1056/NEJMoa1511939',
        snippet: 'Intensive BP control',
        relevanceScore: 0.98,
        evidenceTier: 'Tier A (RCT)',
      },
    ]);
    fixture.detectChanges();

    expect(component.evidenceTierBadgeClass()).toContain('emerald');
  });
});

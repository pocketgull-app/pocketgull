// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EdgeAutonomousVoiceAgentComponent } from './edge-autonomous-voice-agent.component';
import { EdgeAutonomousVoiceAgentService } from '../../services/voice/edge-autonomous-voice-agent.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EdgeAutonomousVoiceAgentComponent', () => {
  let component: EdgeAutonomousVoiceAgentComponent;
  let fixture: ComponentFixture<EdgeAutonomousVoiceAgentComponent>;
  let service: EdgeAutonomousVoiceAgentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeAutonomousVoiceAgentComponent],
      providers: [EdgeAutonomousVoiceAgentService]
    }).compileComponents();

    fixture = TestBed.createComponent(EdgeAutonomousVoiceAgentComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(EdgeAutonomousVoiceAgentService);
    service.clearOfflineQueue();
    service.clearTranscript();
    fixture.detectChanges();
  });

  it('should create successfully with SCRIBE as default active tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('SCRIBE');
    expect(component.engineDisplayName()).toContain('Deterministic');
  });

  it('should toggle voice scribing listening state', () => {
    expect(service.isListening()).toBe(false);
    component.toggleListening();
    expect(service.isListening()).toBe(true);

    component.toggleListening();
    expect(service.isListening()).toBe(false);
  });

  it('should toggle air-gap Wi-Fi blackout simulation', () => {
    const initialAirGap = service.isAirGapped();
    component.toggleAirGap();
    expect(service.isAirGapped()).toBe(!initialAirGap);
  });

  it('should load sample clinical dialogue and update transcript text', () => {
    expect(component.fullTranscriptText()).toBe('');
    component.loadSample(component.sampleDialogues[0].transcript);

    expect(component.fullTranscriptText()).toContain('Metformin 500.0 mg');
    expect(component.transcriptWordCount()).toBeGreaterThan(10);

    component.clearTranscript();
    expect(component.fullTranscriptText()).toBe('');
    expect(component.transcriptWordCount()).toBe(0);
  });

  it('should synthesize SBAR and display ISMP medication intercept', async () => {
    component.loadSample('Patient on Metformin 500.0 mg PO BID and Lisinopril .5 mg daily. Assessment stable.');
    await component.synthesizeSbar();

    const lastSynthesis = service.lastSynthesis();
    expect(lastSynthesis?.ismpAudit.violations.length).toBeGreaterThanOrEqual(1);
    expect(lastSynthesis?.fullNote).toMatch(/metformin 500 mg/i);
    expect(lastSynthesis?.fullNote).toContain('0.5 mg');

    expect(service.queuedBundles().length).toBe(1);
    expect(service.pendingSyncCount()).toBe(1);
  });

  it('should switch tabs between SCRIBE and QUEUE, and display queued bundles', async () => {
    component.loadSample('Clinical note sample text for queue testing');
    await component.synthesizeSbar();

    component.activeTab.set('QUEUE');
    expect(component.activeTab()).toBe('QUEUE');
    expect(service.queuedBundles().length).toBe(1);

    const bundle = service.queuedBundles()[0];
    component.viewRawBundle(bundle);
    expect(component.activeTab()).toBe('RAW_BUNDLE');
    expect(component.selectedBundle()?.id).toBe(bundle.id);
    expect(component.rawJsonDisplay()).toContain('Bundle');
  });

  it('should flush and synchronize queued offline bundles to EHR', async () => {
    component.loadSample('Acute consult for offline queuing');
    await component.synthesizeSbar();
    expect(service.pendingSyncCount()).toBe(1);

    await component.flushQueueToEhr();
    expect(service.pendingSyncCount()).toBe(0);
    expect(component.flushMessage()).toContain('Successfully synchronized 1 offline FHIR bundle(s)');
  });

  it('should delete a specific bundle and clear entire queue', async () => {
    component.loadSample('Note one');
    await component.synthesizeSbar();
    component.loadSample('Note two');
    await component.synthesizeSbar();
    expect(service.queuedBundles().length).toBe(2);

    const firstId = service.queuedBundles()[0].id;
    component.deleteBundle(firstId);
    expect(service.queuedBundles().length).toBe(1);

    component.clearAllQueue();
    expect(service.queuedBundles().length).toBe(0);
  });

  it('should emit close output when close button is clicked', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.close.emit();
    expect(closed).toBe(true);
  });
});

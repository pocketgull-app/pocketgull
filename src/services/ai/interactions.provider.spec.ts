import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@angular/compiler';
import { InteractionsProvider } from './interactions.provider';

describe('InteractionsProvider', () => {
    let provider: InteractionsProvider;

    beforeEach(() => {
        provider = new InteractionsProvider();
    });

    it('1. should be created and default to gemini-3.7-flash with 2048 thinking budget', () => {
        expect(provider).toBeTruthy();
        expect(provider.isConnected()).toBe(true);
        expect(provider.activeModel()).toBe('gemini-3.7-flash');
        expect(provider.thinkingBudget()).toBe(2048);
    });

    it('2. should allow dynamically adjusting thinking budget', () => {
        provider.setThinkingBudget(4096);
        expect(provider.thinkingBudget()).toBe(4096);

        provider.setThinkingBudget(-100);
        expect(provider.thinkingBudget()).toBe(0);
    });

    it('3. should generate clinical metrics correctly', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ complexity: 7, stability: 8, certainty: 9 })
        } as any);

        const metrics = await provider.generateMetrics('Sample clinical report text');
        expect(metrics).toEqual({
            complexity: 7,
            stability: 8,
            certainty: 9
        });
    });

    it('4. should detect clinical changes between snapshots', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ significant: true })
        } as any);

        const result = await provider.detectClinicalChanges('old data', 'new data');
        expect(result).toBe(true);
    });

    it('5. should start chat and send messages with session tracking', async () => {
        globalThis.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ok: true })
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ text: 'Clinical response from model' })
            } as any);

        await provider.startChat('Patient vitals: normal', 'Cardiology consult');
        const reply = await provider.sendMessage('What is the treatment plan?');

        expect(reply).toBe('Clinical response from model');
    });

    it('6. should purge session for HIPAA compliance', () => {
        provider.purgeSession('test-session');
        provider.purgeAllSessions();
        expect(provider.lastError()).toBeNull();
    });
});

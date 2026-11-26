// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe, sanitizeHtmlForSsr } from './safe-html.pipe';

describe('SafeHtmlPipe & SSR HTML Sanitizer', () => {
  it('strips executable tags, event handlers, srcdoc, and dangerous URI schemes during SSR', () => {
    const malicious = [
      '<p>Safe Clinical Note</p>',
      '<script>alert("xss")</script>',
      '<iframe src="https://example.com" srcdoc="<script>1</script>"></iframe>',
      '<object data="evil.swf"></object><embed src="evil.swf">',
      '<svg onload="alert(1)"><path d="M0 0"/></svg>',
      '<img src="x" onerror="fetch(\'https://example.com\')">',
      '<a href="javascript:alert(1)">click</a>',
      '<a href="&#x6a;avascript:alert(2)">entity</a>',
      '<a href="data:text/html,<script>alert(3)</script>">data</a>'
    ].join('');

    const sanitized = sanitizeHtmlForSsr(malicious);
    expect(sanitized).toContain('<p>Safe Clinical Note</p>');
    expect(sanitized).not.toMatch(/<script/i);
    expect(sanitized).not.toMatch(/<iframe/i);
    expect(sanitized).not.toMatch(/<object/i);
    expect(sanitized).not.toMatch(/<embed/i);
    expect(sanitized).not.toMatch(/\bonload\s*=/i);
    expect(sanitized).not.toMatch(/\bonerror\s*=/i);
    expect(sanitized).not.toMatch(/javascript:/i);
    expect(sanitized).not.toMatch(/data:text\/html/i);
    expect(sanitized).not.toMatch(/srcdoc/i);
  });

  it('invokes deterministic SSR sanitization before bypassSecurityTrustHtml on server platform', () => {
    let passedToBypass = '';
    const mockSanitizer = {
      bypassSecurityTrustHtml: (val: string) => {
        passedToBypass = val;
        return val;
      }
    } as unknown as DomSanitizer;

    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    });

    const pipe = runInInjectionContext(injector, () => new SafeHtmlPipe());
    pipe.transform('<div>Vitals OK</div><script>stealPhi()</script><img src=x onerror=alert(1)>');

    expect(passedToBypass).toContain('<div>Vitals OK</div>');
    expect(passedToBypass).not.toContain('<script>');
    expect(passedToBypass).not.toMatch(/onerror/i);
  });
});

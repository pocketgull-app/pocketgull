// SPDX-License-Identifier: Apache-2.0
import { Pipe, PipeTransform, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import * as DOMPurify from 'dompurify';

/**
 * Deterministic SSR-safe HTML sanitizer used whenever DOMPurify lacks a browser DOM.
 * Strips executable elements (<script>, <iframe>, <object>, <embed>, <applet>, <base>,
 * <meta>, <foreignObject>), inline on*= event attributes (including <svg onload=...>),
 * srcdoc attributes, and javascript:/vbscript:/data: URI payloads.
 */
export function sanitizeHtmlForSsr(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;
  let prev = '';
  let pass = 0;

  while (html !== prev && pass < 10) {
    prev = html;
    pass++;

    // 1. Remove dangerous paired blocks (<script>, <iframe>, <object>, <embed>, <applet>, <foreignObject>)
    html = html.replace(
      /<(script|iframe|object|embed|applet|foreignobject|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      ''
    );

    // 2. Remove dangerous standalone/unclosed tags
    html = html.replace(
      /<\/?(script|iframe|object|embed|applet|base|meta|link|foreignobject|style)\b[^>]*>/gi,
      ''
    );

    // 3. Strip inline on* event handler attributes (quoted, unquoted, or whitespace-padded)
    html = html.replace(
      /(\s)on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi,
      '$1'
    );

    // 4. Strip srcdoc attributes on any remaining elements
    html = html.replace(
      /(\s)srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      '$1'
    );

    // 5. Neutralize javascript:, vbscript:, and data: URIs in href/src/xlink:href/action/formaction
    html = html.replace(
      /\b(href|src|xlink:href|action|formaction|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (fullMatch, attrName: string, dqVal?: string, sqVal?: string, uqVal?: string) => {
        const rawVal = dqVal ?? sqVal ?? uqVal ?? '';
        // Decode numeric/named entities and strip ASCII control chars/whitespace before scheme check
        const normalized = rawVal
          .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
          .replace(/[\x00-\x20]+/g, '')
          .toLowerCase();

        if (
          normalized.startsWith('javascript:') ||
          normalized.startsWith('vbscript:') ||
          normalized.startsWith('data:')
        ) {
          return `${attrName}=""`;
        }
        return fullMatch;
      }
    );
  }

  return html;
}

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  transform(value: string): SafeHtml {
    if (!value) return value;

    let cleanHtml: string;
    // Safely resolve DOMPurify without falling back to Object.prototype.default during prototype pollution attacks
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const purify = hasOwnDefault ? (DOMPurify as Record<string, unknown>)['default'] : DOMPurify;

    if (
      this.isBrowser &&
      purify &&
      typeof (purify as { sanitize?: unknown }).sanitize === 'function'
    ) {
      cleanHtml = (purify as { sanitize: (dirty: string, cfg: Record<string, unknown>) => string }).sanitize(value, {
        USE_PROFILES: { html: true, svg: true },
        SANITIZE_NAMED_PROPS: true,
        ADD_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd']
      });
    } else {
      // SSR or headless runtime: enforce deterministic server-safe HTML sanitization before trust bypass
      cleanHtml = sanitizeHtmlForSsr(value);
    }

    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}

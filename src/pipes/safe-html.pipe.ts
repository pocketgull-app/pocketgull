import { Pipe, PipeTransform, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import * as DOMPurify from 'dompurify';

@Pipe({
    name: 'safeHtml',
    standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
    private isBrowser: boolean;
    private platformId = inject(PLATFORM_ID);

    constructor(
        private sanitizer: DomSanitizer
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    transform(value: string): SafeHtml {
        if (!value) return value;
        
        let cleanHtml = value;
        // Safely resolve DOMPurify without falling back to Object.prototype.default during prototype pollution attacks
        const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
        const purify = hasOwnDefault ? (DOMPurify as any).default : DOMPurify;
        
        if (this.isBrowser && typeof purify.sanitize === 'function') {
            cleanHtml = purify.sanitize(value, {
                USE_PROFILES: { html: true, svg: true },
                SANITIZE_NAMED_PROPS: true,
                ADD_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd']
            });
        }
        
        return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    }
}

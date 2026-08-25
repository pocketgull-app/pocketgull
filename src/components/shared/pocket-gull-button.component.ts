import { Component, ChangeDetectionStrategy, input, output, computed, inject, ElementRef, ViewChild, AfterContentChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { PetAuditoryService } from '../../services/pet-auditory.service';
import { ThemeService } from '../../services/theme.service';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'pocket-gull-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      [attr.aria-label]="ariaLabel() || (!hasContent() ? 'Action Button' : null)"
      [attr.data-tooltip]="ariaLabel() || null"
      [attr.data-testid]="testId() || null"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <div class="w-3 h-3 border-2 border-current border-t-transparent rounded-sm animate-spin" [class.mr-2]="hasContent()"></div>
      } @else if (icon()) {
        <div class="flex items-center justify-center h-full" [class.mr-2]="hasContent()" [innerHTML]="iconHtml()"></div>
      }
      
      <span class="text-center shrink-0" [ngClass]="hasContent() ? 'flex-grow' : 'hidden'" #contentWrapper>
        <ng-content></ng-content>
      </span>
      
      @if (trailingIcon() && !loading()) {
        <div class="flex items-center justify-center h-full" [class.ml-2]="hasContent()" [innerHTML]="trailingIconHtml()"></div>
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .btn-base {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      white-space: nowrap;
      cursor: pointer;
      min-height: 44px;
    }

    .btn-base:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Tooltips */
    .btn-base[data-tooltip]::before,
    .btn-base[data-tooltip]::after {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
      font-family: inherit;
    }

    .btn-base[data-tooltip]::after {
      content: attr(data-tooltip);
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: #1C1C1C;
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 2px;
      font-size: 10px;
      font-weight: 500;
      white-space: nowrap;
      letter-spacing: 0.05em;
      text-transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #333;
    }
    
    .btn-base[data-tooltip]::before {
      content: '';
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      border-width: 4px 4px 0;
      border-style: solid;
      border-color: #333 transparent transparent transparent;
    }

    .btn-base[data-tooltip]:hover:not(:disabled)::after,
    .btn-base[data-tooltip]:hover:not(:disabled)::before {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Primary */
    .btn-primary {
      background: #1C1C1C;
      color: white;
      border: 1px solid #1C1C1C;
    }
    .btn-primary:not(:disabled):hover {
      background: #558B2F;
      border-color: #558B2F;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(85, 139, 47, 0.2);
    }

    /* Secondary */
    .btn-secondary {
      background: #FFFFFF;
      color: #374151;
      border: 1px solid #E5E7EB;
    }
    .btn-secondary:not(:disabled):hover {
      background: #F9FAFB;
      border-color: #D1D5DB;
      color: #111827;
    }

    /* Danger */
    .btn-danger {
      background: #FFFFFF;
      color: #DC2626;
      border: 1px solid #FCA5A5;
    }
    .btn-danger:not(:disabled):hover {
      background: #FEF2F2;
      border-color: #DC2626;
    }

    /* Ghost */
    .btn-ghost {
      background: transparent;
      color: #6B7280;
      border: 1px solid transparent;
    }
    .btn-ghost:not(:disabled):hover {
      background: rgba(0, 0, 0, 0.05);
      color: #111827;
    }

    /* Outline */
    .btn-outline {
      background: transparent;
      color: #1C1C1C;
      border: 1px solid #1C1C1C;
    }
    .btn-outline:not(:disabled):hover {
      background: #1C1C1C;
      color: white;
    }

    /* Sizes */
    .size-xs {
      padding: 0.375rem 0.75rem;
      font-size: 9px;
    }
    .size-sm {
      padding: 0.5rem 1rem;
      font-size: 10px;
    }
    .size-md {
      padding: 0.75rem 1.5rem;
      font-size: 12px;
    }
    .size-lg {
      padding: 1rem 2rem;
      font-size: 14px;
    }
    
    /* Icon Only Aspect Ratio Overrides - Touch Friendly Sizes */
    .icon-only.size-xs { padding: 0.5rem; width: 36px; height: 36px; }
    .icon-only.size-sm { padding: 0.625rem; width: 44px; height: 44px; }
    .icon-only.size-md { padding: 0.75rem; width: 52px; height: 52px; }
    .icon-only.size-lg { padding: 1rem; width: 60px; height: 60px; }
    
    /* Dark Mode Defaults */
    :host-context(.dark) .btn-primary,
    :host-context(html.dark) .btn-primary {
      background: #fafafa;
      color: #09090b;
      border-color: #fafafa;
    }
    :host-context(.dark) .btn-primary:not(:disabled):hover,
    :host-context(html.dark) .btn-primary:not(:disabled):hover {
      background: #8bc34a;
      border-color: #8bc34a;
      color: #09090b;
    }
    :host-context(.dark) .btn-secondary,
    :host-context(html.dark) .btn-secondary {
      background: #18181b;
      color: #e4e4e7;
      border-color: #27272a;
    }
    :host-context(.dark) .btn-secondary:not(:disabled):hover,
    :host-context(html.dark) .btn-secondary:not(:disabled):hover {
      background: #27272a;
      color: #fafafa;
      border-color: #3f3f46;
    }
    :host-context(.dark) .btn-danger,
    :host-context(html.dark) .btn-danger {
      background: #18181b;
      color: #f87171;
      border-color: #7f1d1d;
    }
    :host-context(.dark) .btn-danger:not(:disabled):hover,
    :host-context(html.dark) .btn-danger:not(:disabled):hover {
      background: #450a0a;
      border-color: #991b1b;
    }
    :host-context(.dark) .btn-ghost,
    :host-context(html.dark) .btn-ghost {
      color: #a1a1aa;
    }
    :host-context(.dark) .btn-ghost:not(:disabled):hover,
    :host-context(html.dark) .btn-ghost:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fafafa;
    }
    :host-context(.dark) .btn-outline,
    :host-context(html.dark) .btn-outline {
      color: #fafafa;
      border-color: #fafafa;
    }
    :host-context(.dark) .btn-outline:not(:disabled):hover,
    :host-context(html.dark) .btn-outline:not(:disabled):hover {
      background: #fafafa;
      color: #09090b;
    }

    /* Dark Mode Tooltips */
    :host-context(.dark) .btn-base[data-tooltip]::after,
    :host-context(html.dark) .btn-base[data-tooltip]::after {
      background: #FAFAFA;
      color: #1C1C1C;
      border-color: #E5E7EB;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    :host-context(.dark) .btn-base[data-tooltip]::before,
    :host-context(html.dark) .btn-base[data-tooltip]::before {
      border-color: #E5E7EB transparent transparent transparent;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PocketGullButtonComponent implements AfterContentChecked {
  private sanitizer = inject(DomSanitizer);

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<string>('');
  trailingIcon = input<string>('');
  type = input<'button' | 'submit' | 'reset'>('button');
  ariaLabel = input<string>('');
  testId = input<string>('');

  clicked = output<MouseEvent>();

  @ViewChild('contentWrapper') contentWrapper?: ElementRef<HTMLElement>;
  hasContent = signal<boolean>(false);

  ngAfterContentChecked() {
    if (this.contentWrapper?.nativeElement) {
      const content = this.contentWrapper.nativeElement.textContent?.trim() || '';
      if (this.hasContent() !== (content.length > 0)) {
        this.hasContent.set(content.length > 0);
      }
    }
  }

  private wrapSvgPath(raw: string) {
    if (!raw) return '';
    let html: string;
    if (raw.includes('<')) {
      html = raw;
    } else {
      html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="${raw}"></path></svg>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  iconHtml = computed(() => this.wrapSvgPath(this.icon()));
  trailingIconHtml = computed(() => this.wrapSvgPath(this.trailingIcon()));

  buttonClasses(): string {
    return [
      'btn-base',
      `btn-${this.variant()}`,
      `size-${this.size()}`,
      !this.hasContent() ? 'icon-only' : '',
      this.disabled() ? 'disabled' : ''
    ].filter(Boolean).join(' ');
  }

  private petAuditory = (() => { try { return inject(PetAuditoryService, { optional: true }); } catch (e) { console.debug('[PocketGullButton] PetAuditoryService DI fallback:', (e as Error)?.message); return null; } })();
  private themeService = (() => { try { return inject(ThemeService, { optional: true }); } catch (e) { console.debug('[PocketGullButton] ThemeService DI fallback:', (e as Error)?.message); return null; } })();

  onClick(event: MouseEvent) {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}


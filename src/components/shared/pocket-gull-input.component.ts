import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pocket-gull-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label [for]="inputId()" class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 ml-1">
          {{ label() }}
        </label>
      }
      
      <div class="relative group">
        @if (icon()) {
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 group-focus-within:text-[#689F38] dark:group-focus-within:text-[#8bc34a] transition-colors h-4 w-4 flex items-center justify-center" [innerHTML]="iconHtml()"></div>
        }
        
        @if (type() === 'textarea') {
          <textarea
            #inputEl
            [id]="inputId()"
            [placeholder]="placeholder()"
            [attr.aria-label]="ariaLabel() || label() || placeholder()"
            [attr.aria-describedby]="error() ? inputId() + '-error' : (hint() ? inputId() + '-hint' : null)"
            [attr.aria-invalid]="!!error()"
            [disabled]="disabled()"
            [value]="value()"
            (input)="onModelChange(inputEl.value)"
            [class]="inputClasses()"
            [rows]="rows()"
          ></textarea>
        } @else {
          <input
            #inputEl
            [id]="inputId()"
            [type]="type()"
            [placeholder]="placeholder()"
            [attr.aria-label]="ariaLabel() || label() || placeholder()"
            [attr.aria-describedby]="error() ? inputId() + '-error' : (hint() ? inputId() + '-hint' : null)"
            [attr.aria-invalid]="!!error()"
            [disabled]="disabled()"
            [value]="value()"
            (input)="onModelChange(inputEl.value)"
            [class]="inputClasses()"
            class="input-base min-h-[44px]"
          />
        }
        
        @if (error()) {
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-red-500 dark:text-brand-red-400 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        }
      </div>
      
      @if (error() || hint()) {
        <p [id]="error() ? inputId() + '-error' : inputId() + '-hint'"
           [class]="error() ? 'text-brand-red-500 dark:text-brand-red-400' : 'text-gray-500 dark:text-zinc-400'" class="text-xs font-medium tracking-wide ml-1 font-mono">
          {{ error() || hint() }}
        </p>
      }
    </div>
  `,
  styles: [`
    .input-base {
      width: 100%;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #111827;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(8px);
    }

    .input-base:focus {
      outline: none;
      border-color: #689F38;
      background: #FFFFFF;
      box-shadow: 0 0 0 4px rgba(104, 159, 56, 0.1);
    }

    .input-base:disabled {
      background: #F9FAFB;
      cursor: not-allowed;
      border-color: #F3F4F6;
      color: #9CA3AF;
    }

    .input-error {
      border-color: #FCA5A5;
      background: #FFF5F5;
    }
    
    .input-error:focus {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
    
    /* Dark Mode Defaults */
    :host-context(.dark) .input-base,
    :host-context(html.dark) .input-base {
      background: rgba(24, 24, 27, 0.6);
      border-color: #27272a;
      color: #fafafa;
    }
    :host-context(.dark) .input-base:focus,
    :host-context(html.dark) .input-base:focus {
      background: #18181b;
      border-color: #8bc34a;
      box-shadow: 0 0 0 4px rgba(139, 195, 74, 0.1);
    }
    :host-context(.dark) .input-base:disabled,
    :host-context(html.dark) .input-base:disabled {
      background: #09090b;
      border-color: #18181b;
      color: #71717a;
    }
    :host-context(.dark) .input-error,
    :host-context(html.dark) .input-error {
      border-color: #991b1b;
      background: rgba(127, 29, 29, 0.2);
    }
    :host-context(.dark) .input-error:focus,
    :host-context(html.dark) .input-error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .has-icon {
      padding-left: 2.5rem;
    }

    .variant-minimal {
      background: transparent;
      border-color: transparent;
      padding-left: 0;
      padding-right: 0;
      backdrop-filter: none;
      font-size: 14px;
    }

    .variant-minimal:focus {
      background: transparent;
      border-color: transparent;
      box-shadow: none;
    }

    /* Box Breathing Animation */
    .animate-box-breathing {
      animation: box-breathing-border 16s linear infinite, box-breathing-caret 16s linear infinite !important;
    }
    .animate-box-breathing:focus {
      outline: none;
    }

    @keyframes box-breathing-border {
      0% { 
        border-color: #E5E7EB; 
        box-shadow: 0 0 0 0 rgba(62, 188, 158, 0); 
      }
      25% { 
        border-color: #3ebc9e; 
        box-shadow: 0 0 0 4px rgba(62, 188, 158, 0.25); 
      }
      50% { 
        border-color: #3ebc9e; 
        box-shadow: 0 0 0 4px rgba(62, 188, 158, 0.25); 
      }
      75% { 
        border-color: #E5E7EB; 
        box-shadow: 0 0 0 0 rgba(62, 188, 158, 0); 
      }
      100% { 
        border-color: #E5E7EB; 
        box-shadow: 0 0 0 0 rgba(62, 188, 158, 0); 
      }
    }
    
    @keyframes box-breathing-caret {
      0% { caret-color: transparent; }
      25% { caret-color: #3ebc9e; }
      50% { caret-color: #3ebc9e; }
      75% { caret-color: transparent; }
      100% { caret-color: transparent; }
    }

    input.input-base {
      padding: 0.75rem 1rem;
    }

    textarea.input-base {
      padding: 1rem;
      resize: vertical;
      min-height: 100px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PocketGullInputComponent implements AfterViewInit {
  inputId = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'password' | 'textarea' | 'number'>('text');
  variant = input<'default' | 'minimal'>('default');
  disabled = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');
  icon = input<string>('');
  rows = input<number>(4);
  ariaLabel = input<string>('');

  breathing = input<boolean>(false);
  autofocus = input<boolean>(false);

  value = input<string>('');
  valueChange = output<string>();

  inputEl = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputEl');

  private sanitizer = inject(DomSanitizer);

  ngAfterViewInit() {
    if (this.autofocus() && !this.disabled()) {
      setTimeout(() => {
        this.inputEl()?.nativeElement.focus();
      }, 150);
    }
  }

  iconHtml = computed(() => {
    const raw = this.icon();
    if (!raw) return '';
    let html: string;
    if (raw.includes('<')) {
      html = raw;
    } else {
      html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="${raw}"></path></svg>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  onModelChange(val: string) {
    console.log('[PocketGullInput] onModelChange called with value:', val);
    this.valueChange.emit(val);
  }

  inputClasses = computed(() => {
    return [
      'input-base',
      this.error() ? 'input-error' : '',
      this.icon() ? 'has-icon' : '',
      this.variant() === 'minimal' ? 'variant-minimal' : '',
      this.breathing() ? 'animate-box-breathing' : ''
    ].join(' ');
  });

  focus() {
    setTimeout(() => {
      this.inputEl()?.nativeElement?.focus();
    }, 50);
  }
}

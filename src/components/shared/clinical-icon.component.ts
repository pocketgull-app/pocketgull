import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { ClinicalIcons } from '../../assets/clinical-icons';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconTheme = 'western' | 'tcm' | 'ayurvedic' | 'inherit';

@Component({
  selector: 'app-clinical-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span 
      class="inline-flex items-center justify-center transition-colors duration-200"
      [class]="sizeClass()"
      [class.text-cyan-500]="theme() === 'western'"
      [class.dark:text-cyan-400]="theme() === 'western'"
      [class.text-emerald-600]="theme() === 'tcm'"
      [class.dark:text-emerald-400]="theme() === 'tcm'"
      [class.text-amber-500]="theme() === 'ayurvedic'"
      [class.dark:text-amber-400]="theme() === 'ayurvedic'"
      [innerHTML]="safeSvgMarkup()">
    </span>
  `
})
export class ClinicalIconComponent {
  private sanitizer = inject(DomSanitizer);

  name = input.required<string>();
  size = input<IconSize>('md');
  theme = input<IconTheme>('inherit');

  sizeClass = computed(() => {
    switch (this.size()) {
      case 'xs': return 'w-3 h-3 text-xs';
      case 'sm': return 'w-4 h-4 text-sm';
      case 'lg': return 'w-6 h-6 text-lg';
      case 'xl': return 'w-8 h-8 text-xl';
      case 'md':
      default: return 'w-5 h-5 text-base';
    }
  });

  safeSvgMarkup = computed<SafeHtml>(() => {
    const iconName = this.name();
    const rawMarkup = (ClinicalIcons as Record<string, string>)[iconName] || ClinicalIcons.Assessment;
    return this.sanitizer.bypassSecurityTrustHtml(rawMarkup);
  });
}

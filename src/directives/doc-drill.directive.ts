import { Directive, Input, HostListener, HostBinding, inject } from '@angular/core';
import { DocDrillService, DocDrillPersona } from '../services/doc-drill.service';

@Directive({
  selector: '[appDocDrill]',
  standalone: true
})
export class AppDocDrillDirective {
  private readonly docDrill = inject(DocDrillService);

  @Input('appDocDrill') term: string = '';
  @Input() drillCategory?: string;
  @Input() drillPersona?: DocDrillPersona;
  @Input() drillContext?: string;

  @HostBinding('class.doc-node') readonly isDocNode = true;
  @HostBinding('attr.role') readonly role = 'button';
  @HostBinding('attr.tabindex') readonly tabIndex = 0;

  @HostBinding('attr.aria-label') get ariaLabel(): string {
    return `Drill down and learn about ${this.term || 'concept'}`;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent | Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.term) return;

    this.docDrill.openDrill(this.term, {
      category: this.drillCategory,
      persona: this.drillPersona,
      context: this.drillContext
    });
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydown(event: KeyboardEvent | Event): void {
    event.preventDefault();
    if (!this.term) return;

    this.docDrill.openDrill(this.term, {
      category: this.drillCategory,
      persona: this.drillPersona,
      context: this.drillContext
    });
  }
}

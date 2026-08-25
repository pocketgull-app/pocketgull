import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowListenerService {
  public isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  public isDraggingColumn = signal<boolean>(false);
  public isDraggingVoiceCol = signal<boolean>(false);

  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private boundOnResize: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.boundOnResize = this.handleWindowResize.bind(this);
      window.addEventListener('resize', this.boundOnResize);
    }
  }

  private handleWindowResize(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        this.isMobile.set(window.innerWidth < 768);
      }
    }, 150);
  }

  public bindColumnDrag(
    onDrag: (event: MouseEvent) => void,
    onStop: () => void
  ): { onMouseMove: (e: MouseEvent) => void; onMouseUp: (e: MouseEvent) => void } {
    this.isDraggingColumn.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'col-resize';
    }

    const onMouseMove = (e: MouseEvent) => onDrag(e);
    const onMouseUp = (_e: MouseEvent) => {
      this.isDraggingColumn.set(false);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMouseMove);
      }
      onStop();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }

    return { onMouseMove, onMouseUp };
  }

  public bindVoiceColDrag(
    onDrag: (event: MouseEvent) => void,
    onStop: () => void
  ): { onMouseMove: (e: MouseEvent) => void; onMouseUp: (e: MouseEvent) => void } {
    this.isDraggingVoiceCol.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'col-resize';
    }

    const onMouseMove = (e: MouseEvent) => onDrag(e);
    const onMouseUp = (_e: MouseEvent) => {
      this.isDraggingVoiceCol.set(false);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMouseMove);
      }
      onStop();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }

    return { onMouseMove, onMouseUp };
  }

  public destroy(): void {
    if (typeof window !== 'undefined' && this.boundOnResize) {
      window.removeEventListener('resize', this.boundOnResize);
    }
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
  }
}

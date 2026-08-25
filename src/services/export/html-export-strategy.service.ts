import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlExportStrategyService {
  /**
   * Triggers a styled print window with the provided HTML markup.
   */
  public printHtmlContent(title: string, htmlContent: string): void {
    if (typeof window === 'undefined') return;

    const printWin = window.open('', '_blank', 'width=1024,height=800');
    if (!printWin) {
      console.warn('[HtmlExportStrategyService] Print window opening failed (popup blocked?)');
      return;
    }

    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; background: #fff; }
            h1, h2, h3 { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }
}

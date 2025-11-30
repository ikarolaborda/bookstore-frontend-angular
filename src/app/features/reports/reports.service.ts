import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ReportFormat = 'PDF' | 'CSV' | 'XML' | 'JSON';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  private formatsSignal = signal<string[]>([]);
  private loadingSignal = signal(false);

  readonly formats = this.formatsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  loadFormats(): void {
    this.http.get<string[]>(`${this.apiUrl}/formats`).pipe(
      tap(formats => this.formatsSignal.set(formats))
    ).subscribe();
  }

  generateBooksReport(format: ReportFormat): Observable<Blob> {
    this.loadingSignal.set(true);

    let contentType: string;
    switch (format) {
      case 'PDF':
        contentType = 'application/pdf';
        break;
      case 'CSV':
        contentType = 'text/csv';
        break;
      case 'XML':
        contentType = 'application/xml';
        break;
      case 'JSON':
        contentType = 'application/json';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    return this.http.get(`${this.apiUrl}/books`, {
      params: { format },
      responseType: 'blob',
      headers: { Accept: contentType }
    }).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  downloadReport(blob: Blob, format: ReportFormat): void {
    const extension = format.toLowerCase();
    const filename = `books-report-${new Date().toISOString().split('T')[0]}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

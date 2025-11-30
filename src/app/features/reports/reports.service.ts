import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ReportFormat = 'PDF' | 'CSV' | 'XML' | 'JSON';
export type ReportType = 'BOOKS' | 'AUTHORS' | 'USERS' | 'STORES' | 'BOOKS_BY_AUTHOR';

export interface ReportFilters {
  limit?: number;
  startDate?: string;
  endDate?: string;
  authorId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  private formatsSignal = signal<string[]>([]);
  private reportTypesSignal = signal<ReportType[]>([]);
  private loadingSignal = signal(false);

  readonly formats = this.formatsSignal.asReadonly();
  readonly reportTypes = this.reportTypesSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  loadFormats(): void {
    this.http.get<string[]>(`${this.apiUrl}/formats`).pipe(
      tap(formats => this.formatsSignal.set(formats))
    ).subscribe();
  }

  loadReportTypes(): void {
    this.http.get<ReportType[]>(`${this.apiUrl}/types`).pipe(
      tap(types => this.reportTypesSignal.set(types))
    ).subscribe();
  }

  generateBooksReport(format: ReportFormat, limit?: number): Observable<Blob> {
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

    let url = `${this.apiUrl}/books/${format}`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    return this.http.get(url, {
      responseType: 'blob',
      headers: { Accept: contentType }
    }).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  generateReport(type: ReportType, format: ReportFormat, filters?: ReportFilters): Observable<Blob> {
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

    let params = new HttpParams();
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters?.authorId) {
      params = params.set('authorId', filters.authorId.toString());
    }

    return this.http.get(`${this.apiUrl}/${type}/${format}`, {
      params,
      responseType: 'blob',
      headers: { Accept: contentType }
    }).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  downloadReport(blob: Blob, format: ReportFormat, type: ReportType = 'BOOKS'): void {
    const extension = format.toLowerCase();
    const typeName = type.toLowerCase().replace('_', '-');
    const filename = `${typeName}-report-${new Date().toISOString().split('T')[0]}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  createPreviewUrl(blob: Blob): string {
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    return window.URL.createObjectURL(pdfBlob);
  }

  revokePreviewUrl(url: string): void {
    window.URL.revokeObjectURL(url);
  }

  getReportTypeLabel(type: ReportType): string {
    switch (type) {
      case 'BOOKS':
        return 'Books';
      case 'AUTHORS':
        return 'Authors';
      case 'USERS':
        return 'System Users';
      case 'STORES':
        return 'Stores';
      case 'BOOKS_BY_AUTHOR':
        return 'Books by Author';
      default:
        return type;
    }
  }

  getReportTypeDescription(type: ReportType): string {
    switch (type) {
      case 'BOOKS':
        return 'Generate a report of all books in the system';
      case 'AUTHORS':
        return 'Generate a report of all authors';
      case 'USERS':
        return 'Generate a report of system users (Admin only)';
      case 'STORES':
        return 'Generate a report of all bookstores';
      case 'BOOKS_BY_AUTHOR':
        return 'Generate a report of books by a specific author';
      default:
        return '';
    }
  }
}

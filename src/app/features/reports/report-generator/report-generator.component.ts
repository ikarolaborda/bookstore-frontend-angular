import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, ReportFormat, ReportType, ReportFilters } from '../reports.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthorsService } from '../../authors/authors.service';
import { Author } from '../../../shared/models';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-generator.component.html'
})
export class ReportGeneratorComponent implements OnInit {
  reportsService = inject(ReportsService);
  authService = inject(AuthService);
  authorsService = inject(AuthorsService);

  selectedType = signal<ReportType>('BOOKS');
  selectedFormat = signal<ReportFormat>('PDF');
  limit = signal<number | null>(null);
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedAuthorId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  formats: ReportFormat[] = ['PDF', 'CSV', 'XML', 'JSON'];

  readonly isAdmin = this.authService.isAdmin;
  readonly authors = this.authorsService.authors;

  readonly showAuthorSelect = computed(() => this.selectedType() === 'BOOKS_BY_AUTHOR');
  readonly showDateFilters = computed(() => {
    const type = this.selectedType();
    return type !== 'BOOKS_BY_AUTHOR' || this.selectedAuthorId() !== null;
  });

  ngOnInit(): void {
    this.reportsService.loadFormats();
    this.reportsService.loadReportTypes();
    this.authorsService.loadAuthors(0, 100);
  }

  onTypeChange(type: ReportType): void {
    this.selectedType.set(type);
    if (type !== 'BOOKS_BY_AUTHOR') {
      this.selectedAuthorId.set(null);
    }
  }

  generateReport(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.selectedType() === 'BOOKS_BY_AUTHOR' && !this.selectedAuthorId()) {
      this.errorMessage.set('Please select an author for Books by Author report');
      return;
    }

    const filters: ReportFilters = {};
    if (this.limit()) {
      filters.limit = this.limit()!;
    }
    if (this.startDate()) {
      filters.startDate = this.startDate();
    }
    if (this.endDate()) {
      filters.endDate = this.endDate();
    }
    if (this.selectedAuthorId()) {
      filters.authorId = this.selectedAuthorId()!;
    }

    this.reportsService.generateReport(this.selectedType(), this.selectedFormat(), filters).subscribe({
      next: (blob) => {
        this.reportsService.downloadReport(blob, this.selectedFormat(), this.selectedType());
        this.successMessage.set(`Report generated successfully in ${this.selectedFormat()} format!`);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to generate report');
      }
    });
  }

  previewReport(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.selectedType() === 'BOOKS_BY_AUTHOR' && !this.selectedAuthorId()) {
      this.errorMessage.set('Please select an author for Books by Author report');
      return;
    }

    const filters: ReportFilters = {};
    if (this.limit()) {
      filters.limit = this.limit()!;
    }
    if (this.startDate()) {
      filters.startDate = this.startDate();
    }
    if (this.endDate()) {
      filters.endDate = this.endDate();
    }
    if (this.selectedAuthorId()) {
      filters.authorId = this.selectedAuthorId()!;
    }

    this.reportsService.generateReport(this.selectedType(), 'PDF', filters).subscribe({
      next: (blob) => {
        const url = this.reportsService.createPreviewUrl(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to generate preview');
      }
    });
  }

  getFormatDescription(format: ReportFormat): string {
    switch (format) {
      case 'PDF':
        return 'Portable Document Format - Best for printing and sharing';
      case 'CSV':
        return 'Comma-Separated Values - Best for spreadsheet applications';
      case 'XML':
        return 'Extensible Markup Language - Best for data exchange';
      case 'JSON':
        return 'JavaScript Object Notation - Best for web applications';
      default:
        return '';
    }
  }

  getReportTypeLabel(type: ReportType): string {
    return this.reportsService.getReportTypeLabel(type);
  }

  getReportTypeDescription(type: ReportType): string {
    return this.reportsService.getReportTypeDescription(type);
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, ReportFormat } from '../reports.service';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-generator.component.html'
})
export class ReportGeneratorComponent implements OnInit {
  reportsService = inject(ReportsService);

  selectedFormat = signal<ReportFormat>('PDF');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  formats: ReportFormat[] = ['PDF', 'CSV', 'XML', 'JSON'];

  ngOnInit(): void {
    this.reportsService.loadFormats();
  }

  generateReport(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.reportsService.generateBooksReport(this.selectedFormat()).subscribe({
      next: (blob) => {
        this.reportsService.downloadReport(blob, this.selectedFormat());
        this.successMessage.set(`Report generated successfully in ${this.selectedFormat()} format!`);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to generate report');
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
}

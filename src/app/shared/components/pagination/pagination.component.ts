import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PAGE_SIZE_OPTIONS } from '../../models/pagination.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{{ startItem() }}</span>
        to
        <span class="font-medium">{{ endItem() }}</span>
        of
        <span class="font-medium">{{ totalElements() }}</span>
        results
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Per page:</label>
          <select
            [ngModel]="pageSize()"
            (ngModelChange)="onPageSizeChange($event)"
            class="rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            @for (size of pageSizeOptions; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
        </div>

        <nav class="flex items-center gap-1">
          <button
            (click)="goToPage(0)"
            [disabled]="isFirst()"
            class="px-2 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="First page"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <button
            (click)="goToPage(currentPage() - 1)"
            [disabled]="isFirst()"
            class="px-2 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Previous page"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          @for (pageNum of visiblePages(); track pageNum) {
            @if (pageNum === -1) {
              <span class="px-2 py-1 text-gray-400">...</span>
            } @else {
              <button
                (click)="goToPage(pageNum)"
                [class.bg-indigo-600]="pageNum === currentPage()"
                [class.text-white]="pageNum === currentPage()"
                [class.hover:bg-gray-100]="pageNum !== currentPage()"
                class="px-3 py-1 rounded-md text-sm font-medium"
              >
                {{ pageNum + 1 }}
              </button>
            }
          }

          <button
            (click)="goToPage(currentPage() + 1)"
            [disabled]="isLast()"
            class="px-2 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Next page"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            (click)="goToPage(totalPages() - 1)"
            [disabled]="isLast()"
            class="px-2 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Last page"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  `
})
export class PaginationComponent {
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalElements = input.required<number>();
  totalPages = input.required<number>();
  isFirst = input.required<boolean>();
  isLast = input.required<boolean>();

  pageChange = output<number>();
  pageSizeChange = output<number>();

  pageSizeOptions = PAGE_SIZE_OPTIONS;

  startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return this.currentPage() * this.pageSize() + 1;
  });

  endItem = computed(() => {
    const end = (this.currentPage() + 1) * this.pageSize();
    return Math.min(end, this.totalElements());
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (current > 3) {
        pages.push(-1);
      }

      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 4) {
        pages.push(-1);
      }

      pages.push(total - 1);
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(Number(size));
  }
}

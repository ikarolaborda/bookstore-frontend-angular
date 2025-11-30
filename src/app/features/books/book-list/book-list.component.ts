import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksService } from '../books.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { Book } from '../../../shared/models';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    PaginationComponent,
    SearchInputComponent
  ],
  templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
  booksService = inject(BooksService);
  authService = inject(AuthService);

  searchQuery = signal('');
  deleteDialogOpen = signal(false);
  bookToDelete = signal<Book | null>(null);

  ngOnInit(): void {
    this.booksService.loadBooks();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim()) {
      this.booksService.searchByTitle(query, 0, this.booksService.pageSize());
    } else {
      this.booksService.loadBooks(0, this.booksService.pageSize());
    }
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.booksService.loadBooks(0, this.booksService.pageSize());
  }

  onPageChange(page: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.booksService.searchByTitle(query, page, this.booksService.pageSize());
    } else {
      this.booksService.loadBooks(page, this.booksService.pageSize());
    }
  }

  onPageSizeChange(size: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.booksService.searchByTitle(query, 0, size);
    } else {
      this.booksService.loadBooks(0, size);
    }
  }

  openDeleteDialog(book: Book): void {
    this.bookToDelete.set(book);
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const book = this.bookToDelete();
    if (book) {
      this.booksService.delete(book.id).subscribe({
        next: () => {
          this.deleteDialogOpen.set(false);
          this.bookToDelete.set(null);
          this.booksService.refreshCurrentPage();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.deleteDialogOpen.set(false);
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.bookToDelete.set(null);
  }
}

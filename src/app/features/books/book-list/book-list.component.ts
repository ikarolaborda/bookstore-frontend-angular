import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BooksService } from '../books.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Book } from '../../../shared/models';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent
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

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.booksService.searchByTitle(query);
    } else {
      this.booksService.loadBooks();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.booksService.loadBooks();
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

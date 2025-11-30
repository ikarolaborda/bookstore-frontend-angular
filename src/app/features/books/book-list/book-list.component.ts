import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BooksService } from '../books.service';
import { AuthorsService } from '../../authors/authors.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { Book } from '../../../shared/models';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
  BadgeComponent,
  AlertComponent,
  AlertDescriptionComponent,
} from '../../../shared/ui';

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
    SearchInputComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardDescriptionComponent,
    CardFooterComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    AlertComponent,
    AlertDescriptionComponent,
  ],
  templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  booksService = inject(BooksService);
  authService = inject(AuthService);
  authorsService = inject(AuthorsService);

  searchQuery = signal('');
  deleteDialogOpen = signal(false);
  bookToDelete = signal<Book | null>(null);
  authorId = signal<number | null>(null);

  authorName = computed(() => {
    const author = this.authorsService.selectedAuthor();
    return author?.name || null;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const authorIdParam = params['authorId'];
      if (authorIdParam) {
        const id = parseInt(authorIdParam, 10);
        this.authorId.set(id);
        this.authorsService.getById(id).subscribe();
        this.booksService.getByAuthorId(id);
      } else {
        this.authorId.set(null);
        this.booksService.loadBooks();
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim()) {
      this.booksService.searchByTitle(query, 0, this.booksService.pageSize());
    } else {
      this.loadBooksOrByAuthor(0, this.booksService.pageSize());
    }
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.loadBooksOrByAuthor(0, this.booksService.pageSize());
  }

  onPageChange(page: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.booksService.searchByTitle(query, page, this.booksService.pageSize());
    } else {
      this.loadBooksOrByAuthor(page, this.booksService.pageSize());
    }
  }

  onPageSizeChange(size: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.booksService.searchByTitle(query, 0, size);
    } else {
      this.loadBooksOrByAuthor(0, size);
    }
  }

  private loadBooksOrByAuthor(page: number, size: number): void {
    const id = this.authorId();
    if (id) {
      this.booksService.getByAuthorId(id, page, size);
    } else {
      this.booksService.loadBooks(page, size);
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

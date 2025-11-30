import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BooksService } from '../books.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './book-detail.component.html'
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  booksService = inject(BooksService);
  authService = inject(AuthService);

  deleteDialogOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.booksService.getById(id).subscribe({
        error: () => this.router.navigate(['/books'])
      });
    }
  }

  openDeleteDialog(): void {
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const book = this.booksService.selectedBook();
    if (book) {
      this.booksService.delete(book.id).subscribe({
        next: () => {
          this.router.navigate(['/books']);
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
  }
}

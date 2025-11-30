import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthorsService } from '../authors.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { Author } from '../../../shared/models';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
  AlertComponent,
  AlertDescriptionComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
    AlertComponent,
    AlertDescriptionComponent,
  ],
  templateUrl: './author-list.component.html'
})
export class AuthorListComponent implements OnInit {
  authorsService = inject(AuthorsService);
  authService = inject(AuthService);

  searchQuery = signal('');
  deleteDialogOpen = signal(false);
  authorToDelete = signal<Author | null>(null);

  ngOnInit(): void {
    this.authorsService.loadAuthors();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim()) {
      this.authorsService.searchByName(query, 0, this.authorsService.pageSize());
    } else {
      this.authorsService.loadAuthors(0, this.authorsService.pageSize());
    }
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.authorsService.loadAuthors(0, this.authorsService.pageSize());
  }

  onPageChange(page: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.authorsService.searchByName(query, page, this.authorsService.pageSize());
    } else {
      this.authorsService.loadAuthors(page, this.authorsService.pageSize());
    }
  }

  onPageSizeChange(size: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.authorsService.searchByName(query, 0, size);
    } else {
      this.authorsService.loadAuthors(0, size);
    }
  }

  openDeleteDialog(author: Author): void {
    this.authorToDelete.set(author);
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const author = this.authorToDelete();
    if (author) {
      this.authorsService.delete(author.id).subscribe({
        next: () => {
          this.deleteDialogOpen.set(false);
          this.authorToDelete.set(null);
          this.authorsService.refreshCurrentPage();
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.authorToDelete.set(null);
  }
}

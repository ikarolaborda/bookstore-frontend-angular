import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BooksService } from '../books.service';
import { AuthorsService } from '../../authors/authors.service';
import { StoresService } from '../../stores/stores.service';
import { BookRequest } from '../../../shared/models';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.component.html'
})
export class BookFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  booksService = inject(BooksService);
  authorsService = inject(AuthorsService);
  storesService = inject(StoresService);

  bookForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    isbn: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    publishedDate: [''],
    authorId: [null, [Validators.required]],
    storeIds: [[]]
  });

  isEditMode = signal(false);
  bookId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.authorsService.loadAuthors();
    this.storesService.loadStores();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.bookId.set(Number(id));
      this.loadBook(Number(id));
    }
  }

  private loadBook(id: number): void {
    this.booksService.getById(id).subscribe({
      next: (book) => {
        this.bookForm.patchValue({
          title: book.title,
          isbn: book.isbn,
          description: book.description || '',
          price: book.price,
          publishedDate: book.publishedDate || '',
          authorId: book.author?.id,
          storeIds: book.stores?.map(s => s.id) || []
        });
      },
      error: () => {
        this.router.navigate(['/books']);
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.bookForm.value;
      const request: BookRequest = {
        title: formValue.title,
        isbn: formValue.isbn,
        description: formValue.description || undefined,
        price: formValue.price,
        publishedDate: formValue.publishedDate || undefined,
        authorId: formValue.authorId,
        storeIds: formValue.storeIds
      };

      const operation = this.isEditMode()
        ? this.booksService.update(this.bookId()!, request)
        : this.booksService.create(request);

      operation.subscribe({
        next: (book) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/books', book.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to save book');
        }
      });
    }
  }

  toggleStore(storeId: number): void {
    const currentIds: number[] = this.bookForm.get('storeIds')?.value || [];
    const index = currentIds.indexOf(storeId);
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(storeId);
    }
    this.bookForm.patchValue({ storeIds: [...currentIds] });
  }

  isStoreSelected(storeId: number): boolean {
    const currentIds: number[] = this.bookForm.get('storeIds')?.value || [];
    return currentIds.includes(storeId);
  }
}

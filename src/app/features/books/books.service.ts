import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/books`;

  private booksSignal = signal<Book[]>([]);
  private selectedBookSignal = signal<Book | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly books = this.booksSignal.asReadonly();
  readonly selectedBook = this.selectedBookSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly booksCount = computed(() => this.booksSignal().length);

  loadBooks(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Book[]>(this.apiUrl).pipe(
      tap(books => this.booksSignal.set(books)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  getById(id: number): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      tap(book => this.selectedBookSignal.set(book)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  searchByTitle(title: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams().set('title', title);
    this.http.get<Book[]>(`${this.apiUrl}/search`, { params }).pipe(
      tap(books => this.booksSignal.set(books)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Search failed')
    });
  }

  getByAuthorId(authorId: number): void {
    this.loadingSignal.set(true);
    this.http.get<Book[]>(`${this.apiUrl}/author/${authorId}`).pipe(
      tap(books => this.booksSignal.set(books)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  getByStoreId(storeId: number): void {
    this.loadingSignal.set(true);
    this.http.get<Book[]>(`${this.apiUrl}/store/${storeId}`).pipe(
      tap(books => this.booksSignal.set(books)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  getByPriceRange(minPrice: number, maxPrice: number): void {
    this.loadingSignal.set(true);
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString());

    this.http.get<Book[]>(`${this.apiUrl}/price-range`, { params }).pipe(
      tap(books => this.booksSignal.set(books)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  create(request: BookRequest): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.post<Book>(this.apiUrl, request).pipe(
      tap(book => {
        this.booksSignal.update(books => [...books, book]);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: BookRequest): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.put<Book>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedBook => {
        this.booksSignal.update(books =>
          books.map(book => book.id === id ? updatedBook : book)
        );
        this.selectedBookSignal.set(updatedBook);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.booksSignal.update(books => books.filter(book => book.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearSelectedBook(): void {
    this.selectedBookSignal.set(null);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookRequest, PageResponse, DEFAULT_PAGE_SIZE } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/books`;

  private pageResponseSignal = signal<PageResponse<Book> | null>(null);
  private selectedBookSignal = signal<Book | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly pageResponse = this.pageResponseSignal.asReadonly();
  readonly books = computed(() => this.pageResponseSignal()?.content || []);
  readonly selectedBook = this.selectedBookSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly currentPage = computed(() => this.pageResponseSignal()?.page || 0);
  readonly pageSize = computed(() => this.pageResponseSignal()?.size || DEFAULT_PAGE_SIZE);
  readonly totalElements = computed(() => this.pageResponseSignal()?.totalElements || 0);
  readonly totalPages = computed(() => this.pageResponseSignal()?.totalPages || 0);
  readonly isFirst = computed(() => this.pageResponseSignal()?.first ?? true);
  readonly isLast = computed(() => this.pageResponseSignal()?.last ?? true);

  loadBooks(page = 0, size = DEFAULT_PAGE_SIZE, sortBy = 'title', sortDir: 'asc' | 'desc' = 'asc'): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    this.http.get<PageResponse<Book>>(this.apiUrl, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  searchByTitle(title: string, page = 0, size = DEFAULT_PAGE_SIZE): void {
    if (!title.trim()) {
      this.loadBooks(page, size);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('title', title)
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Book>>(`${this.apiUrl}/search`, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Search failed')
    });
  }

  getById(id: number): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      tap(book => this.selectedBookSignal.set(book)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  getByAuthorId(authorId: number, page = 0, size = DEFAULT_PAGE_SIZE): void {
    this.loadingSignal.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Book>>(`${this.apiUrl}/author/${authorId}`, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  getByStoreId(storeId: number, page = 0, size = DEFAULT_PAGE_SIZE): void {
    this.loadingSignal.set(true);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Book>>(`${this.apiUrl}/store/${storeId}`, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  getByPriceRange(minPrice: number, maxPrice: number, page = 0, size = DEFAULT_PAGE_SIZE): void {
    this.loadingSignal.set(true);
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Book>>(`${this.apiUrl}/price-range`, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load books')
    });
  }

  create(request: BookRequest): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.post<Book>(this.apiUrl, request).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: BookRequest): Observable<Book> {
    this.loadingSignal.set(true);
    return this.http.put<Book>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedBook => {
        this.selectedBookSignal.set(updatedBook);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearSelectedBook(): void {
    this.selectedBookSignal.set(null);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  refreshCurrentPage(): void {
    const currentPage = this.currentPage();
    const currentSize = this.pageSize();
    this.loadBooks(currentPage, currentSize);
  }
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Store, StoreRequest, PageResponse, DEFAULT_PAGE_SIZE } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stores`;

  private pageResponseSignal = signal<PageResponse<Store> | null>(null);
  private selectedStoreSignal = signal<Store | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly pageResponse = this.pageResponseSignal.asReadonly();
  readonly stores = computed(() => this.pageResponseSignal()?.content || []);
  readonly selectedStore = this.selectedStoreSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly currentPage = computed(() => this.pageResponseSignal()?.page || 0);
  readonly pageSize = computed(() => this.pageResponseSignal()?.size || DEFAULT_PAGE_SIZE);
  readonly totalElements = computed(() => this.pageResponseSignal()?.totalElements || 0);
  readonly totalPages = computed(() => this.pageResponseSignal()?.totalPages || 0);
  readonly isFirst = computed(() => this.pageResponseSignal()?.first ?? true);
  readonly isLast = computed(() => this.pageResponseSignal()?.last ?? true);

  loadStores(page = 0, size = DEFAULT_PAGE_SIZE, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    this.http.get<PageResponse<Store>>(this.apiUrl, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load stores')
    });
  }

  searchByName(name: string, page = 0, size = DEFAULT_PAGE_SIZE): void {
    if (!name.trim()) {
      this.loadStores(page, size);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());

    this.http.get<PageResponse<Store>>(`${this.apiUrl}/search`, { params }).pipe(
      tap(response => this.pageResponseSignal.set(response)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Search failed')
    });
  }

  getById(id: number): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.get<Store>(`${this.apiUrl}/${id}`).pipe(
      tap(store => this.selectedStoreSignal.set(store)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  create(request: StoreRequest): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.post<Store>(this.apiUrl, request).pipe(
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: StoreRequest): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.put<Store>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedStore => {
        this.selectedStoreSignal.set(updatedStore);
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

  clearSelectedStore(): void {
    this.selectedStoreSignal.set(null);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  refreshCurrentPage(): void {
    const currentPage = this.currentPage();
    const currentSize = this.pageSize();
    this.loadStores(currentPage, currentSize);
  }
}

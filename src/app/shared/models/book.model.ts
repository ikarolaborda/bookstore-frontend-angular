import { Author } from './author.model';
import { Store } from './store.model';

export interface Book {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  price: number;
  publishedDate?: string;
  author?: Author;
  stores?: Store[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BookRequest {
  title: string;
  isbn: string;
  description?: string;
  price: number;
  publishedDate?: string;
  authorId: number;
  storeIds?: number[];
}

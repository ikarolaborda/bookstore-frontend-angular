export interface Author {
  id: number;
  name: string;
  biography?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorRequest {
  name: string;
  biography?: string;
  birthDate?: string;
}

export interface Store {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreRequest {
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

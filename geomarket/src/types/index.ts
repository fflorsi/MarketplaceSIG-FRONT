export interface User {
  id: number;
  name: string;
  email: string;
  type: 'client' | 'owner' | 'admin';
  coordinates: string; // WKT format
  radius: number;
  address: string;
}

export interface Store {
  id: number;
  name: string;
  coordinates: string; // WKT format
  ownerId: number;
  approved: boolean;
  state: 'pending' | 'accepted' | 'declined';
  address: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  hasDiscount: boolean;
  discount: number; // percentage
  discountPrice?: number;
  storeId: number;
  description?: string;
  image?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  stores: Store[];
  products: Product[];
  users: User[];
}
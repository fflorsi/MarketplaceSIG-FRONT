import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Store, Product } from '../types';
import { mockUsers, mockStores, mockProducts } from '../data/mockData';

interface AppContextType {
  state: AppState;
  login: (user: User) => void;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => void;
  addStore: (storeData: Omit<Store, 'id' | 'approved'>) => void;
  approveStore: (storeId: number) => void;
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (productId: number, productData: Partial<Product>) => void;
  getStoresByOwner: (ownerId: number) => Store[];
  getProductsByStore: (storeId: number) => Product[];
  updateUser: (id: number, data: Partial<User>) => void;
  setStores: (stores: Store[]) => void;
  setProducts: (products: Product[]) => void;

}

type Action = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'ADD_STORE'; payload: Store }
  | { type: 'APPROVE_STORE'; payload: number }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_PRODUCT'; payload: { id: number; data: Partial<Product> } }
  | { type: 'SET_STORES'; payload: Store[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] };


const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false
  },
  stores: mockStores,
  products: mockProducts,
  users: mockUsers
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true
        }
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false
        }
      };
    case 'REGISTER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'ADD_STORE':
      return {
        ...state,
        stores: [...state.stores, action.payload]
      };
    case 'APPROVE_STORE':
      return {
        ...state,
        stores: state.stores.map(store =>
          store.id === action.payload ? { ...store, approved: true } : store
        )
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };

  case 'UPDATE_USER':
    return {
      ...state,
      users: state.users.map(u =>
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      ),
      auth: {
        ...state.auth,
        user: state.auth.user && state.auth.user.id === action.payload.id
          ? { ...state.auth.user, ...action.payload }
          : state.auth.user
      }
    };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id 
            ? { ...product, ...action.payload.data }
            : product
        )
      };

    case 'SET_STORES':
      return {
        ...state,
        stores: action.payload
      };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload
      };

    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
    
  
useEffect(() => {
  // Al cargar la app, intenta restaurar la sesión desde localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    dispatch({ type: 'LOGIN', payload: JSON.parse(storedUser) });
  }
}, []);


const login = (userData: User) => {
  dispatch({ type: 'LOGIN', payload: userData });
  localStorage.setItem('user', JSON.stringify(userData));
};

const logout = () => {
  dispatch({ type: 'LOGOUT' });
  localStorage.removeItem('user');
};

const register = (userData: Omit<User, 'id'>) => {
  const maxId = state.users.length > 0
    ? Math.max(...state.users.map(u => Number(u.id) || 0))
    : 0;
  const newUser: User = {
    ...userData,
    id: maxId + 1
  };
  dispatch({ type: 'REGISTER', payload: newUser });
};


const updateUser = (id: number, data: Partial<User>) => {
  dispatch({ type: 'UPDATE_USER', payload: { id, ...data } });
};

const addStore = (storeData: Omit<Store, 'id' | 'approved'>) => {
  const maxId = state.stores.length > 0
    ? Math.max(...state.stores.map(s => Number(s.id) || 0))
    : 0;
  const newStore: Store = {
    ...storeData,
    id: maxId + 1,
    approved: false
  };
  dispatch({ type: 'ADD_STORE', payload: newStore });
};

  const approveStore = (storeId: number) => {
    dispatch({ type: 'APPROVE_STORE', payload: storeId });
  };


const addProduct = (productData: Omit<Product, 'id'>) => {
  const maxId = state.products.length > 0
    ? Math.max(...state.products.map(p => Number(p.id) || 0))
    : 0;
  const newProduct: Product = {
    ...productData,
    id: maxId + 1
  };
  dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
};

  const updateProduct = (productId: number, productData: Partial<Product>) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, data: productData } });
  };

  const getStoresByOwner = (ownerId: number): Store[] => {
    return state.stores.filter(store => store.ownerId === ownerId);
  };

  const getProductsByStore = (storeId: number): Product[] => {
    return state.products.filter(product => product.storeId === storeId);
  };

    const setStores = (stores: Store[]) => {
    dispatch({ type: 'SET_STORES', payload: stores });
  };



  const setProducts = (products: Product[]) => {
  dispatch({ type: 'SET_PRODUCTS', payload: products });
};


  return (
    <AppContext.Provider value={{
      state,
      login,
      logout,
      register,
      addStore,
      approveStore,
      addProduct,
      updateProduct,
      getStoresByOwner,
      updateUser,
      getProductsByStore,
      setStores,
      setProducts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
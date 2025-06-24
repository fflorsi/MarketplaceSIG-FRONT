import { User, Store, Product } from '../types';
import { coordinatesToWKT } from '../utils/geocoding';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin Usuario',
    email: 'admin@marketplace.com',
    type: 'admin',
    coordinates: coordinatesToWKT(-34.6037, -58.3816),
    radius: 10,
    address: 'Buenos Aires, Argentina'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria@email.com',
    type: 'owner',
    coordinates: coordinatesToWKT(-34.6087, -58.3756),
    radius: 5,
    address: 'Palermo, Buenos Aires'
  },
  {
    id: 3,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    type: 'client',
    coordinates: coordinatesToWKT(-34.6118, -58.3960),
    radius: 7,
    address: 'Recoleta, Buenos Aires'
  },
  {
    id: 4,
    name: 'Ana López',
    email: 'ana@email.com',
    type: 'owner',
    coordinates: coordinatesToWKT(-34.5998, -58.3732),
    radius: 5,
    address: 'Villa Crespo, Buenos Aires'
  }
];

export const mockStores: Store[] = [
  {
    id: 1,
    name: 'Electrónica Premium',
    coordinates: coordinatesToWKT(-34.6087, -58.3756),
    ownerId: 2,
    approved: true,
    address: 'Av. Santa Fe 2450, Palermo',
    description: 'Tienda especializada en electrónicos y gadgets'
  },
  {
    id: 2,
    name: 'Moda & Style',
    coordinates: coordinatesToWKT(-34.6118, -58.3960),
    ownerId: 4,
    approved: true,
    address: 'Av. Corrientes 1500, Centro',
    description: 'Ropa y accesorios de moda'
  },
  {
    id: 3,
    name: 'Librería Conocimiento',
    coordinates: coordinatesToWKT(-34.6048, -58.3845),
    ownerId: 2,
    approved: false,
    address: 'Av. Rivadavia 3200, Balvanera',
    description: 'Libros nuevos y usados'
  }
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Smartphone Premium',
    price: 89999,
    hasDiscount: true,
    discountPrice: 69999,
    storeId: 1,
    description: 'Último modelo con cámara de 108MP'
  },
  {
    id: 2,
    name: 'Auriculares Bluetooth',
    price: 15999,
    hasDiscount: false,
    storeId: 1,
    description: 'Cancelación de ruido activa'
  },
  {
    id: 3,
    name: 'Laptop Gaming',
    price: 159999,
    hasDiscount: true,
    discountPrice: 139999,
    storeId: 1,
    description: 'RTX 4060, 16GB RAM, SSD 1TB'
  },
  {
    id: 4,
    name: 'Vestido Elegante',
    price: 12999,
    hasDiscount: false,
    storeId: 2,
    description: 'Perfecto para ocasiones especiales'
  },
  {
    id: 5,
    name: 'Zapatillas Deportivas',
    price: 25999,
    hasDiscount: true,
    discountPrice: 19999,
    storeId: 2,
    description: 'Comodidad y estilo para el día a día'
  }
];
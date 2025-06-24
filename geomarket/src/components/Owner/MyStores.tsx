import React, { useState, useEffect } from 'react';
import { Plus, Store, Edit, Package, Tag } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AddStoreForm from './AddStoreForm';
import StoreManagement from './StoreManagement';
import { listShops, listProductsByShop } from '../../api/backend';
import { parseAnyCoordinates, reverseGeocode } from '../../utils/geocoding';

type StoreWithCounts = {
  id: number;
  name: string;
  address?: string;
  description?: string;
  status: string;
  state: 'accepted' | 'pending' | 'declined';
  user_id: number;
  productsCount: number;
  offersCount: number;
};

const MyStores: React.FC = () => {
  const { state } = useApp();
  const { user } = state.auth;
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [myStores, setMyStores] = useState<StoreWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<{ [storeId: number]: string }>({});


useEffect(() => {
  if (!user || user.type !== 'owner') return;
  setLoading(true);
  listShops()
    .then(async (shops) => {
      const userShops = shops.filter((shop: any) => shop.user_id === user.id);

      const shopsWithCounts = await Promise.all(
        userShops.map(async (shop: any) => {
          let products = [];
          try {
            products = await listProductsByShop(shop.id);
          } catch (e) {
            console.error(`Error fetching products for shop ${shop.id}:`, e);
            products = [];
          }
          const productsCount = products.length;
          const offersCount = products.filter((p: any) => p.has_discount).length;
          return {
            ...shop,
            state: shop.status || 'pending',
            productsCount,
            offersCount,
          };
        })
      );
      setMyStores(shopsWithCounts);

      // Obtener direcciones por coordenadas
      const addressEntries = await Promise.all(
        shopsWithCounts.map(async (shop) => {
          if (shop.coordinates) {
            const { lat, lng } = parseAnyCoordinates(shop.coordinates);
            const address = await reverseGeocode(lat, lng);
            return [shop.id, address];
          }
          return [shop.id, ''];
        })
      );
      setAddresses(Object.fromEntries(addressEntries));
    })
    .finally(() => setLoading(false));
}, [user]);

  if (!user || user.type !== 'owner') return null;

  if (showAddForm) {
    return <AddStoreForm onBack={() => setShowAddForm(false)} />;
  }

  if (selectedStore) {
    return (
      <StoreManagement 
        storeId={selectedStore} 
        onBack={() => setSelectedStore(null)} 
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-dark mb-2">Mis Tiendas</h2>
          <p className="text-gray-600">Gestiona tus tiendas y productos</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Tienda</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando tiendas...</div>
      ) : myStores.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes tiendas</h3>
          <p className="text-gray-500 mb-4">
            Crea tu primera tienda para comenzar a vender tus productos.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
          >
            Crear Primera Tienda
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myStores.map(store => {
            let statusLabel = '';
            let statusClass = '';
            if (store.state === 'accepted') {
                statusLabel = 'Aprobada';
                statusClass = 'bg-green-100 text-green-800';
              } else if (store.state === 'pending') {
                statusLabel = 'Pendiente';
                statusClass = 'bg-yellow-100 text-yellow-800';
              } else if (store.state === 'declined') {
                statusLabel = 'Cancelada';
                statusClass = 'bg-red-100 text-red-800';
              }
                         
              const approved = store.state === 'accepted';


              return (
              <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-dark">{store.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                      {statusLabel}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                          {addresses[store.id] || 'Obteniendo dirección...'}
                        </p>
                  {store.description && (
                    <p className="text-gray-500 text-sm mb-4">{store.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-1" />
                        {store.productsCount} productos
                      </div>
                      {store.offersCount > 0 && (
                       <div className="flex items-center text-primary font-medium">
                          <Tag className="h-4 w-4 mr-1" />
                          {store.offersCount} ofertas
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStore(store.id)}
                    disabled={!approved}
                    className={`w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 ${
                      approved
                        ? 'bg-secondary text-white hover:bg-secondary-hover'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Gestionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyStores;
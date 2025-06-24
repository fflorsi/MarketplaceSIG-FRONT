import React, { useState } from 'react';
import { MapPin, Package, Tag, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { parseAnyCoordinates, reverseGeocode } from '../../utils/geocoding';
import { calculateDistance } from '../../utils/distance';
import StoreDetail from './StoreDetail';
import { listShops } from '../../api/backend';



const StoreList: React.FC = () => {
  const { state } = useApp();
  const { user } = state.auth;
  const { products } = state;
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<{ [storeId: number]: string }>({});
  

  React.useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        const data = await listShops();
        setStores(data);
      } catch (e) {
        console.error(e);
        setStores([]);
      }
      setLoading(false);
    }
    fetchStores();
  }, []);

    
React.useEffect(() => {
  async function fetchAddresses() {
    const newAddresses: { [storeId: number]: string } = {};
    await Promise.all(
      stores.map(async (store) => {
        if (!store.coordinates) return;
        const coords = parseAnyCoordinates(store.coordinates);
        const addr = await reverseGeocode(coords.lat, coords.lng);
        newAddresses[store.id] = addr;
      })
    );
    setAddresses(newAddresses);
  }
  if (stores.length > 0) fetchAddresses();
}, [stores]);




  if (!user) return null;

  const approvedStores = stores.filter(store => store.status === 'accepted');

    const userCoords = parseAnyCoordinates(user.coordinates);
    const storesWithDistance = approvedStores.map(store => {
      const storeCoords = parseAnyCoordinates(store.coordinates);
      const distance = calculateDistance(
        userCoords.lat,
        userCoords.lng,
        storeCoords.lat,
        storeCoords.lng
      );
      return { ...store, distance: Math.round(distance * 100) / 100 };
    });

  // Mostrar todas las tiendas si es admin, si no, solo las cercanas
const storesWithinRadius = user.type === 'admin'
  ? storesWithDistance.sort((a, b) => a.distance - b.distance)
  : storesWithDistance
      .filter(store => store.distance <= user.radius)
      .sort((a, b) => a.distance - b.distance);

  const getStoreProducts = (storeId: number) => {
    return products.filter(product => product.storeId === storeId);
  };

  

  const getStoreOffers = (storeId: number) => {
    return products.filter(product => product.storeId === storeId && product.hasDiscount);
  };

  if (loading) {
    return <div className="p-6">Cargando tiendas...</div>;
  }

  if (selectedStore) {
    return (
      <StoreDetail
        storeId={selectedStore}
        onBack={() => setSelectedStore(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-2">Tiendas Cercanas</h2>
        {user.type === 'client' || user.type === 'owner' ? (
          <p className="text-gray-600">
            {storesWithinRadius.length} tiendas dentro de {user.radius}km de tu ubicación
          </p>
        ) : (
          <p className="text-gray-600">
            Mostrando {storesWithinRadius.length} tiendas aprobadas en total
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {storesWithinRadius.map(store => {
          const storeProducts = getStoreProducts(store.id);
          const storeOffers = getStoreOffers(store.id);
          
          return (
            <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-dark">{store.name}</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {store.distance}km
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{addresses[store.id] || 'Cargando dirección...'}</p>
                
                {store.description && (
                  <p className="text-gray-500 text-sm mb-4">{store.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      {storeProducts.length} productos
                    </div>
                    {storeOffers.length > 0 && (
                      <div className="flex items-center text-primary font-medium">
                        <Tag className="h-4 w-4 mr-1" />
                        {storeOffers.length} ofertas
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStore(store.id)}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Tienda</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {storesWithinRadius.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tiendas cercanas</h3>
          <p className="text-gray-500">
            No se encontraron tiendas dentro de {user.radius}km de tu ubicación.
            Intenta aumentar tu radio de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default StoreList;
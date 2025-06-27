import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../contexts/AppContext';
import { parseAnyCoordinates } from '../../utils/geocoding';
import { calculateDistance } from '../../utils/distance';
import { listShops, listProductsByShop } from '../../api/backend.ts';
import { Store, Product } from '../../types';

interface RawStore {
  id: number;
  name: string;
  coordinates: string;
  user_id: number;
  status: string;
  address?: string;
  description?: string;
}

interface RawProduct {
  id: number;
  name: string;
  price: number;
  has_discount?: boolean;
  discount_price?: number;
  shop_id: number;
  description?: string;
  image?: string;
}

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView: React.FC = () => {
  const { state, setStores, setProducts } = useApp();
  const { user } = state.auth;
  const { stores, products } = state;

  // Cargar tiendas desde el backend
useEffect(() => {
  async function fetchStoresAndProducts() {
    try {
      const data: RawStore[] = await listShops();
      const adapted: Store[] = data.map((store) => ({
        id: store.id,
        name: store.name,
        coordinates: store.coordinates,
        ownerId: store.user_id, // Adaptar user_id a ownerId
        approved: store.status === 'accepted', 
        address: store.address ?? '', // Si no viene, poner string vacío
        description: store.description ?? ''
      }));
      setStores(adapted);

      // Cargar productos reales de cada tienda
      let allProducts: Product[] = [];
      for (const store of adapted) {
        try {
          const products: RawProduct[] = await listProductsByShop(store.id);
          allProducts = allProducts.concat(
            products.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              hasDiscount: p.has_discount ?? false, // Adaptar has_discount a hasDiscount
              discountPrice: p.discount_price ?? undefined,
              storeId: p.shop_id ?? store.id, // Adaptar shop_id a storeId
              description: p.description ?? '',
              image: p.image ?? ''
            }))
          );
        } catch (e) {
          console.error(e);
        }
      }
      setProducts(allProducts);
    } catch (e) {
      console.error('Error fetching stores or products:', e);
      setStores([]);
      setProducts([]);
    }
  }
  fetchStoresAndProducts();
}, []);



  if (!user) return null;

const userCoords = parseAnyCoordinates(user.coordinates);
console.log('User coordinates:', userCoords, user.coordinates);
  const mapRef = useRef<any>(null);

  // Para admin: mostrar todas las tiendas aprobadas
  // Para otros usuarios: mostrar solo tiendas dentro del radio
  const storesToShow = user.type === 'admin' 
    ? stores.filter(store => store.approved)
    : stores.filter(store => {
        if (!store.approved) return false;
        const storeCoords = parseAnyCoordinates(store.coordinates);
        const distance = calculateDistance(
          userCoords.lat, 
          userCoords.lng, 
          storeCoords.lat, 
          storeCoords.lng
        );
        return distance <= user.radius;
      });

  const getStoreProducts = (storeId: number) => {
    return products.filter(product => product.storeId === storeId);
  };



  const storeIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const adminIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-full">
      <div className="bg-white p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-dark mb-2">
          {user.type === 'admin' ? 'Mapa de Administración' : 'Mapa de Tiendas'}
        </h2>
        <p className="text-sm text-gray-600">
          {user.type === 'admin' 
            ? `Mostrando ${storesToShow.length} tiendas aprobadas en total`
            : `Mostrando ${storesToShow.length} tiendas dentro de ${user.radius}km de tu ubicación`
          }
        </p>
      </div>
      
      <div className="h-[calc(100vh-12rem)]">
        <MapContainer
          ref={mapRef}
          center={[userCoords.lat, userCoords.lng]}
          zoom={user.type === 'admin' ? 11 : 13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location */}
          <Marker 
            position={[userCoords.lat, userCoords.lng]} 
            icon={user.type === 'admin' ? adminIcon : userIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-primary">
                  {user.type === 'admin' ? 'Ubicación del Administrador' : 'Tu ubicación'}
                </h3>
                <p className="text-sm text-gray-600">{user.address}</p>
                {user.type === 'admin' && (
                  <p className="text-xs text-secondary font-medium mt-1">
                    Vista completa del sistema
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* User radius circle - solo para usuarios no admin */}
          {user.type !== 'admin' && (
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={
                typeof user.radius === 'number' && !isNaN(user.radius)
                  ? user.radius * 1000 // convertir km a metros
                  : 0
              }
              pathOptions={{ 
                color: '#226f54', 
                fillColor: '#87c38f', 
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          )}

          {/* Store markers */}
          {storesToShow.map(store => {
            const storeCoords = parseAnyCoordinates(store.coordinates);
            const storeProducts = getStoreProducts(store.id);
            const offersCount = storeProducts.filter(p => p.hasDiscount).length;
            
            // Calcular distancia solo si no es admin
            let distance = 0;
            if (user.type !== 'admin') {
              distance = calculateDistance(
                userCoords.lat, 
                userCoords.lng, 
                storeCoords.lat, 
                storeCoords.lng
              );
            }
            
            return (
              <Marker 
                key={store.id} 
                position={[storeCoords.lat, storeCoords.lng]} 
                icon={storeIcon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-primary mb-1">{store.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                    {store.description && (
                      <p className="text-xs text-gray-500 mb-2">{store.description}</p>
                    )}
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Productos:</span> {storeProducts.length}
                      </div>
                      {offersCount > 0 && (
                        <div className="text-sm text-primary font-medium">
                          🏷️ {offersCount} ofertas disponibles
                        </div>
                      )}
                      {user.type !== 'admin' && (
                        <div className="text-xs text-gray-500">
                          📍 {Math.round(distance * 100) / 100}km de distancia
                        </div>
                      )}
                      {user.type === 'admin' && (
                        <div className="text-xs text-secondary font-medium">
                          👤 ID Propietario: {store.ownerId}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
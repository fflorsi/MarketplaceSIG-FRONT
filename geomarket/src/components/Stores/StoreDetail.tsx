import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Package, Tag } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { listProductsByShop, getShop } from '../../api/backend'; 
import { Store, Product } from '../../types';
import { parseAnyCoordinates, reverseGeocode } from '../../utils/geocoding';

interface StoreDetailProps {
  storeId: number;
  onBack: () => void;
}

interface BackendProduct {
  id: number;
  name: string;
  price: number;
  has_discount?: boolean;
  discount_price?: number;
  discount?: number;
  shop_id: number;
  description?: string;
  image?: string;
}

const StoreDetail: React.FC<StoreDetailProps> = ({ storeId, onBack }) => {
  const { state } = useApp();
  const { users } = state;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');



  useEffect(() => {
    async function fetchStore() {
      try {
        const data = await getShop(storeId);
        // Adaptar los campos a tu modelo Store
        setStore({
          id: data.id,
          name: data.name,
          coordinates: data.coordinates,
          ownerId: data.user_id,
          approved: true,
          address: data.address || '',
          description: data.description || '',
        });
      } catch (e) {
        console.error(e);
        setStore(null);
      }
    }
    fetchStore();
  }, [storeId]);

  useEffect(() => {
  if (store) {
    const coords = parseAnyCoordinates(store.coordinates);
    reverseGeocode(coords.lat, coords.lng).then(setAddress);
  }
}, [store]);

  // Cargar productos
 useEffect(() => {
  async function fetchProducts() {
    setLoading(true);
    try {
      const data: BackendProduct[] = await listProductsByShop(storeId);
      // Mapea los campos del backend al modelo Product
      const mapped: Product[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        hasDiscount: p.has_discount ?? false,
        discount: p.discount ?? 0,
        discountPrice: p.discount_price,
        storeId: p.shop_id ?? storeId,
        description: p.description,
      }));
      setProducts(mapped);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
    setLoading(false);
  }
  fetchProducts();
}, [storeId]);

  if (!store) return null;

  const owner = users.find(u => u.id === store.ownerId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

    const productsWithOffers = products.filter(p => p.hasDiscount);
    const regularProducts = products.filter(p => !p.hasDiscount);

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary hover:text-primary-hover mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a tiendas</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark mb-2">{store.name}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{address || 'Cargando dirección...'}</span>
              </div>
              {owner && (
                <p className="text-sm text-gray-500">Propietario: {owner.name}</p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-secondary text-white px-3 py-1 rounded-full text-sm">
                {products.length} productos
              </div>
            </div>
          </div>

          {store.description && (
            <p className="text-gray-600 mb-4">{store.description}</p>
          )}

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center text-gray-600">
              <Package className="h-4 w-4 mr-1" />
              {products.length} productos totales
            </div>
            {productsWithOffers.length > 0 && (
              <div className="flex items-center text-primary font-medium">
                <Tag className="h-4 w-4 mr-1" />
                {productsWithOffers.length} con descuento
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando productos...</div>
      ) : (
        <>
          {/* Products with offers */}
          {productsWithOffers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-dark mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                Productos en Oferta
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productsWithOffers.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary">
                    <h3 className="font-semibold text-dark mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                        {product.hasDiscount && (
                          <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                           {product.discount}% OFF
                        </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(product.price - (product.price * (product.discount / 100)))}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular products */}
          {regularProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-dark mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-secondary" />
                Otros Productos
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-dark mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    )}
                    <div className="text-xl font-bold text-dark">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-500">Esta tienda aún no tiene productos publicados.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreDetail;
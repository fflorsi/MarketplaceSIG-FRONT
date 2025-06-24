import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Package, Tag } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import * as api from '../../api/backend';

interface StoreManagementProps {
  storeId: number;
  onBack: () => void;
}

function mapBackendProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    hasDiscount: product.has_discount ?? false,
    discount: product.discount ?? 0,
    discountPrice: product.discount_price,
    storeId: product.shop_id,
    description: product.description,
    image: product.image,
  };
}


const StoreManagement: React.FC<StoreManagementProps> = ({ storeId, onBack }) => {
  const { state, getProductsByStore, setProducts } = useApp();
  const { stores } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);


  useEffect(() => {
    async function fetchProducts() {
      try {
        const backendProducts = await api.listProductsByShop(storeId);
        const mapped = backendProducts.map(mapBackendProduct);
        setProducts(mapped);
      } catch (e) {
        console.error(e);
        // Maneja el error si quieres
      }
    }
    fetchProducts();
  }, [storeId, setProducts]);

  const store = stores.find(s => s.id === storeId);
  const products = getProductsByStore(storeId);
  if (!store) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (showAddForm) {
    return (
      <AddProductForm 
        storeId={storeId}
        onBack={() => setShowAddForm(false)} 
      />
    );
  }

  if (editingProduct) {
    return (
      <EditProductForm 
        productId={editingProduct}
        onBack={() => setEditingProduct(null)} 
      />
    );
  }

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
          <span>Volver a mis tiendas</span>
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-dark mb-2">{store.name}</h2>
            <p className="text-gray-600">{store.address}</p>
            {store.description && (
              <p className="text-gray-500 text-sm mt-1">{store.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-secondary mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{products.length}</p>
              <p className="text-gray-600 text-sm">Productos Totales</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Tag className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{productsWithOffers.length}</p>
              <p className="text-gray-600 text-sm">Con Descuento</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-accent mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{regularProducts.length}</p>
              <p className="text-gray-600 text-sm">Precio Regular</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products with offers */}
      {productsWithOffers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-dark mb-4 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-primary" />
            Productos en Oferta
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productsWithOffers.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-dark">{product.name}</h4>
                  <button
                    onClick={() => setEditingProduct(product.id)}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                      {product.discount}% OFF
                    </span>
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
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-dark mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-secondary" />
            Productos Regulares
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-dark">{product.name}</h4>
                  <button
                    onClick={() => setEditingProduct(product.id)}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                )}
                <div className="text-lg font-bold text-dark">
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
          <p className="text-gray-500 mb-4">
            Añade tu primer producto para comenzar a vender.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
          >
            Añadir Primer Producto
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
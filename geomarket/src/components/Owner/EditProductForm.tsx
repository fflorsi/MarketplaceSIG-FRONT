import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import * as api from '../../api/backend';

interface EditProductFormProps {
  productId: number;
  onBack: () => void;
}

interface UpdateProductPayload {
  name: string;
  price: number;
  has_discount: boolean;
  discount_price?: number;
  description?: string;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ productId, onBack }) => {
  const { state, updateProduct } = useApp();
  const product = state.products.find(p => p.id === productId);
  
  const [formData, setFormData] = useState({
  name: product?.name || '',
  price: product?.price || 0,
  hasDiscount: product?.hasDiscount || false,
  discountPrice: product?.discountPrice || 0,
  discount: product?.discount || 0,
  description: product?.description || ''
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false); // Solo una vez

if (!product) return null;

const discountPrice = formData.hasDiscount
  ? formData.price - (formData.price * (formData.discount / 100))
  : formData.price;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!formData.name || formData.price <= 0) {
    setError('Por favor completa todos los campos obligatorios');
    return;
  }

  if (formData.hasDiscount && (formData.discount <= 0 || formData.discount >= 100)) {
    setError('El porcentaje de descuento debe ser mayor a 0 y menor a 100');
    return;
  }

  setLoading(true);
  try {
    await api.updateProduct(productId, {
      name: formData.name,
      price: formData.price,
      has_discount: formData.hasDiscount,
      discount: formData.hasDiscount ? formData.discount : 0,
      description: formData.description,
    });
    onBack();
  } catch (err: any) {
    setError(err.message || 'Error al actualizar el producto');
  } finally {
    setLoading(false);
  }
};

return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary hover:text-primary-hover mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>
        <h2 className="text-2xl font-bold text-dark">Editar Producto</h2>
        <p className="text-gray-600">Modifica los detalles de tu producto</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
              Nombre del Producto *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: Smartphone Premium"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-dark mb-2">
              Precio *
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
          </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.hasDiscount}
              onChange={(e) => setFormData({
                ...formData,
                hasDiscount: e.target.checked,
                discount: e.target.checked ? formData.discount : 0
              })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-dark">Este producto tiene descuento</span>
          </label>
        </div>

        {formData.hasDiscount && (
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-dark mb-2">
              Porcentaje de Descuento (%) *
            </label>
            <input
              id="discount"
              type="number"
              min="1"
              max="99"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: 20"
            />
            <div className="text-xs text-gray-500 mt-1">
              Precio con descuento: <b>${discountPrice.toFixed(2)}</b>
            </div>
          </div>
        )}

        {/* ...descripción y botones... */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-secondary text-white py-2 px-4 rounded-md hover:bg-secondary-hover transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default EditProductForm;
import React, { useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface AddProductFormProps {
  storeId: number;
  onBack: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ storeId, onBack }) => {
  const { addProduct } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    hasDiscount: false,
    discountPercentage: 0,
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || formData.price <= 0) {
      setError('Por favor completa todos los campos obligatorios');
      setIsLoading(false);
      return;
    }

    if (formData.hasDiscount && (formData.discountPercentage <= 0 || formData.discountPercentage >= 100)) {
      setError('El porcentaje de descuento debe ser mayor a 0% y menor a 100%');
      setIsLoading(false);
      return;
    }

    try {
      const discountPrice = formData.hasDiscount 
        ? formData.price * (1 - formData.discountPercentage / 100)
        : undefined;

      await addProduct({
        name: formData.name,
        price: formData.price,
        hasDiscount: formData.hasDiscount,
        discount: formData.hasDiscount ? formData.discountPercentage : 0,
        discountPrice,
        storeId,
        description: formData.description
      });

      onBack();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Database error: Product ID conflict')) {
          setError('Error de base de datos: Conflicto de IDs. Por favor contacta al administrador para resolver este problema.');
        } else if (error.message.includes('Database constraint error')) {
          setError('Error de restricción de base de datos. Por favor verifica los datos ingresados.');
        } else {
          setError(error.message || 'Error al crear el producto. Por favor intenta de nuevo.');
        }
      } else {
        setError('Error al crear el producto. Por favor intenta de nuevo.');
      }
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-dark">Nuevo Producto</h2>
        <p className="text-gray-600">Añade un nuevo producto a tu tienda</p>
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
                  discountPercentage: e.target.checked ? formData.discountPercentage : 0
                })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-dark">Este producto tiene descuento</span>
            </label>
          </div>

          {formData.hasDiscount && (
            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-dark mb-2">
                Porcentaje de descuento *
              </label>
              <div className="relative">
                <input
                  id="discountPercentage"
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="10"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              {formData.price > 0 && formData.discountPercentage > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Precio con descuento: ${(formData.price * (1 - formData.discountPercentage / 100)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Describe las características principales del producto"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="h-4 w-4" />
              <span>{isLoading ? 'Creando...' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
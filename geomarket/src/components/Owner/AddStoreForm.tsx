import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { geocodeAddress, reverseGeocode } from '../../utils/geocoding';
import { createShop } from '../../api/backend.ts';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';


interface AddStoreFormProps {
  onBack: () => void;
}

const AddStoreForm: React.FC<AddStoreFormProps> = ({ onBack }) => {
  const { state } = useApp();
  const { user } = state.auth;
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  // Actualiza el marcador cuando cambia la dirección
  useEffect(() => {
    const updateMarker = async () => {
      if (formData.address) {
        try {
          const { lat, lng } = await geocodeAddress(formData.address);
          setMarkerPosition([lat, lng]);
        } catch {
          // Si la dirección no es válida, no muevas el marcador
        }
      }
    };
    updateMarker();
  }, [formData.address]);

  // Actualiza la dirección cuando se mueve el marcador
  useEffect(() => {
    const updateAddress = async () => {
      if (markerPosition) {
        const address = await reverseGeocode(markerPosition[0], markerPosition[1]);
        setFormData(f => ({ ...f, address }));
      }
    };
    updateAddress();
  }, [markerPosition]);

  const DraggableMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
    const markerRef = React.useRef<L.Marker>(null);

    return (
      <Marker
        draggable
        position={position}
        eventHandlers={{
          dragend: (e) => {
            const latlng = e.target.getLatLng();
            setPosition([latlng.lat, latlng.lng]);
          }
        }}
        ref={markerRef}
      />
    );
  };

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || !formData.address) {
      setError('Por favor completa todos los campos obligatorios');
      setIsLoading(false);
      return;
    }

    try {
      // Geocodifica la dirección para asegurarte que es válida
      const { lat, lng } = await geocodeAddress(formData.address);
      // Obtén la dirección normalizada
      const normalizedAddress = await reverseGeocode(lat, lng);

      await createShop({
        name: formData.name,
        address: normalizedAddress || formData.address,
        user_id: user.id
      });

      onBack();
    } catch (err: any) {
      setError('Error al crear la tienda: ' + (err.message || err));
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
        <h2 className="text-2xl font-bold text-dark">Nueva Tienda</h2>
        <p className="text-gray-600">Crea una nueva tienda (requiere aprobación del administrador)</p>
      </div>

      {markerPosition && (
        <div className="mb-4">
          <MapContainer center={markerPosition} zoom={16} style={{ height: 300, width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
          </MapContainer>
          <div className="text-sm text-gray-600 mt-2">
            Arrastrá el marcador para ajustar la ubicación de tu tienda.
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
              Nombre de la Tienda *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: Electrónica Premium"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-dark mb-2">
              Dirección de la Tienda *
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
            />
          </div>

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
              placeholder="Describe brevemente tu tienda y qué tipo de productos vendes"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start">
              <Store className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Proceso de Aprobación</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Tu tienda será revisada por un administrador antes de ser publicada. 
                  Recibirás una notificación una vez que sea aprobada.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creando...' : 'Crear Tienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreForm;
// ...existing code...
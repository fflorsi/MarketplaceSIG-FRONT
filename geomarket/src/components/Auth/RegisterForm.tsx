import React, { useState, useEffect } from 'react';
import { UserPlus, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { geocodeAddress, reverseGeocode } from '../../utils/geocoding';
import * as backend from '../../api/backend'
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

interface RegisterFormProps {
  onToggleMode: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'client',
    address: '',
    radius: 5
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
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

// Cuando el usuario mueve el marcador, actualiza la dirección
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


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  if (!formData.name || !formData.email || !formData.password || !formData.address) {
    setError('Por favor completa todos los campos');
    setIsLoading(false);
    return;
  }

  try {
    // 1. Geocodifica la dirección para asegurarte que es válida
    const { lat, lng } = await geocodeAddress(formData.address);

    // 2. Obtén la dirección normalizada (opcional, pero recomendado)
    const normalizedAddress = await reverseGeocode(lat, lng);

    await backend.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      type: formData.type,
      address: normalizedAddress || formData.address, // Usa la dirección normalizada si existe
      radius: formData.radius, // km
    });

    onToggleMode();
  } catch (err) {
    setError('Error al procesar la dirección o registrar el usuario: ' + err);
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-accent flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-dark">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-dark/70">
            Únete a nuestro marketplace
          </p>
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
              Arrastrá el marcador para ajustar tu ubicación.
            </div>
          </div>
        )}

  

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-dark">
                Tipo de Usuario
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'client' | 'owner' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              >
                <option value="client">Cliente</option>
                <option value="owner">Dueño de Tienda</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-dark">
                Dirección
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
              />
            </div>

            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-dark">
                Radio de Interés (km)
              </label>
              <input
                id="radius"
                name="radius"
                type="number"
                min="1"
                max="50"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:text-primary-hover text-sm font-medium"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default RegisterForm;
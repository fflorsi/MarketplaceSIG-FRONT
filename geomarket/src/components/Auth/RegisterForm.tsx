import React, { useState, useEffect } from 'react';
import { UserPlus, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { geocodeAddress, reverseGeocode } from '../../utils/geocoding';
import * as backend from '../../api/backend'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
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
  const [showMap, setShowMap] = useState(false);
  const [requireMapConfirm, setRequireMapConfirm] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState('');

  // Cuando el usuario mueve el marcador, solo actualiza la dirección en el input, pero no la confirmada
  useEffect(() => {
    const updateAddress = async () => {
      if (markerPosition && showMap) {
        const address = await reverseGeocode(markerPosition[0], markerPosition[1]);
        setFormData(f => ({ ...f, address }));
      }
    };
    updateAddress();
    // Solo depende de markerPosition y showMap
  }, [markerPosition, showMap]);

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


  const handleMapSearch = async () => {
    setShowMap(true);
    setRequireMapConfirm(false);
    const address = formData.address;
    if (address.length > 5) {
      try {
        let coords;
        try {
          coords = await geocodeAddress(address);
        } catch {
          // fallback: no-op
        }
        if (coords && coords.lat && coords.lng) {
          setMarkerPosition([coords.lat, coords.lng]);
          // Confirmar la dirección aquí
          const normalized = await reverseGeocode(coords.lat, coords.lng);
          setConfirmedAddress(normalized || address);
        } else {
          setError('No se pudo encontrar la ubicación, por favor ajústela manualmente en el mapa.');
        }
      } catch {
        setError('No se pudo encontrar la ubicación, por favor ajústela manualmente en el mapa.');
      }
    } else {
      setError('Ingrese una dirección válida para buscar en el mapa.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || !formData.email || !formData.password || !confirmedAddress) {
      setError('Por favor completa todos los campos y confirma la dirección.');
      setIsLoading(false);
      return;
    }
    if (!showMap) {
      setShowMap(true);
      setRequireMapConfirm(true);
      setError('Por favor, confirme la dirección en el mapa antes de guardar.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Geocodifica la dirección confirmada para asegurarte que es válida
      const { lat, lng } = await geocodeAddress(confirmedAddress);
      // 2. Obtén la dirección normalizada (opcional, pero recomendado)
      const normalizedAddress = await reverseGeocode(lat, lng);
      await backend.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: formData.type,
        address: normalizedAddress || confirmedAddress, // Usa la dirección confirmada
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
            Únete a nuestro geomarket y descubre un mundo de oportunidades locales.
          </p>
        </div>

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

            <div className="flex items-center">
              <div className="flex-1">
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
              <button
                type="button"
                className="ml-2 flex items-center justify-center"
                style={{ background: '#da2c38', borderRadius: 6, width: 40, height: 40 }}
                onClick={handleMapSearch}
                title="Confirmar ubicación en el mapa"
              >
                <MapPin color="white" size={22} />
              </button>
            </div>
            <div className="text-xs text-gray-700 mt-1">
              Para confirmar la dirección, presiona el botón del pin rojo. La dirección que se guardará es:
              <span className="block font-semibold text-primary mt-1">{confirmedAddress || 'Sin confirmar'}</span>
            </div>
            {showMap && markerPosition && (
              <div className="mb-4">
                <MapContainer center={markerPosition} zoom={16} style={{ height: 300, width: '100%' }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
                  <Circle center={markerPosition} radius={formData.radius * 1000} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />
                </MapContainer>
                <div className="text-sm text-gray-600 mt-2">
                  Arrastrá el marcador para ajustar tu ubicación.<br />
                  {requireMapConfirm && (
                    <div className="mt-2 text-red-600 font-semibold">Por favor, confirme la dirección y vuelva a presionar Crear Cuenta.</div>
                  )}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-dark">
                Radio de Interés (km): <span className="font-semibold">{formData.radius}</span>
              </label>
              <input
                id="radius"
                name="radius"
                type="range"
                min="0"
                max="100"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                className="w-full"
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
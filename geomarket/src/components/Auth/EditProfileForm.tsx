import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { parseAnyCoordinates, reverseGeocode } from '../../utils/geocoding';
import { updateUser as apiUpdateUser } from '../../api/backend';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Icono personalizado para tiendas (rojo)
const storeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const EditProfileForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, updateUser } = useApp();
  const user = state.auth.user;
  const stores = React.useMemo(() => state.stores || [], [state.stores]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    radius: user?.radius || 5,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [storesInRadius, setStoresInRadius] = useState(0);
  const [storesMarkers, setStoresMarkers] = useState<any[]>([]);
  const [requireMapConfirm, setRequireMapConfirm] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState(user?.address || '');

  useEffect(() => {
    if (user?.coordinates) {
      const { lat, lng } = parseAnyCoordinates(user.coordinates);
      setMarkerPosition([lat, lng]);
      reverseGeocode(lat, lng).then(addr => setConfirmedAddress(addr || formData.address));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.coordinates]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (user?.coordinates) {
        const { lat, lng } = parseAnyCoordinates(user.coordinates);
        const address = await reverseGeocode(lat, lng);
        setFormData(f => ({ ...f, address }));
        setConfirmedAddress(address || formData.address);
      }
    };
    fetchAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.coordinates]);

  useEffect(() => {
    const updateAddress = async () => {
      if (markerPosition && showMap) {
        const address = await reverseGeocode(markerPosition[0], markerPosition[1]);
        setFormData(f => ({ ...f, address }));
      }
    };
    updateAddress();
  }, [markerPosition, showMap]);

  // Actualiza la dirección confirmada al mover el marcador manualmente en el mapa
  useEffect(() => {
    if (markerPosition && showMap) {
      reverseGeocode(markerPosition[0], markerPosition[1]).then(addr => {
        setConfirmedAddress(addr || formData.address);
      });
    }
  }, [markerPosition, showMap]);

  // Calcula la cantidad de tiendas y los marcadores dentro del radio
  useEffect(() => {
    if (markerPosition && stores.length > 0) {
      // Filtrar solo tiendas aceptadas o approved true (compatibilidad)
      const approvedStores = stores.filter(store => store.state === 'accepted' || store.approved === true);
      const filtered = approvedStores.filter(store => {
        if (!store.coordinates) return false;
        const { lat, lng } = parseAnyCoordinates(store.coordinates);
        const R = 6371; // km
        const dLat = (lat - markerPosition[0]) * Math.PI / 180;
        const dLng = (lng - markerPosition[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(markerPosition[0]*Math.PI/180) * Math.cos(lat*Math.PI/180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        return d <= formData.radius;
      });
      setStoresInRadius(filtered.length);
      setStoresMarkers(filtered);
    } else {
      setStoresInRadius(0);
      setStoresMarkers([]);
    }
  }, [markerPosition, formData.radius, stores]);

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
    if (!formData.name || !formData.email || !confirmedAddress) {
      setError('Completa todos los campos y confirma la dirección');
      return;
    }
    if (!showMap) {
      setShowMap(true);
      setRequireMapConfirm(true);
      setError('Por favor, confirme la dirección en el mapa antes de guardar.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await apiUpdateUser(user.id, {
        name: formData.name,
        email: formData.email,
        address: confirmedAddress,
        radius: formData.radius,
      });
      const updatedUser = {
        ...user,
        name: response.user.name,
        email: response.user.email,
        address: confirmedAddress,
        coordinates: response.user.coordinates,
        radius: response.user.radius,
        type: response.user.type,
      };
      updateUser(user.id, updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onBack();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error al guardar los cambios: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block mb-1">Nombre</label>
          <input className="w-full border rounded p-2" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input className="w-full border rounded p-2" value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="flex items-center">
          <div className="flex-1">
            <label className="block mb-1">Dirección</label>
            <input className="w-full border rounded p-2" value={formData.address}
              onChange={e => {
                const address = e.target.value;
                setFormData({ ...formData, address });
                // Ya no geocodifica aquí, solo actualiza el texto
              }} />
          </div>
          <button
            type="button"
            className="ml-2 flex items-center justify-center"
            style={{ background: '#da2c38', borderRadius: 6, width: 40, height: 40 }}
            onClick={async () => {
              setShowMap(true);
              setRequireMapConfirm(false);
              const address = formData.address;
              if (address.length > 5) {
                try {
                  let coords;
                  try {
                    coords = parseAnyCoordinates(address);
                  } catch {
                    // Usar Nominatim para geocodificar
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data && data.length > 0) {
                      coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                    }
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
            }}
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
              {storesMarkers.map((store, idx) => {
                const { lat, lng } = parseAnyCoordinates(store.coordinates);
                return (
                  <Marker key={store.id || idx} position={[lat, lng]} icon={storeIcon} />
                );
              })}
            </MapContainer>
            <div className="text-sm text-gray-600 mt-2">
              Arrastrá el marcador azul para ajustar tu ubicación.<br />
              <span className="font-semibold">Tiendas en el radio seleccionado: {storesInRadius}</span>
              {requireMapConfirm && (
                <div className="mt-2 text-red-600 font-semibold">Por favor, confirme la dirección y vuelva a presionar Guardar.</div>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="block mb-1">Radio de Interés (km): <span className="font-semibold">{formData.radius}</span></label>
          <input type="range" min={0} max={100} value={formData.radius}
            onChange={e => setFormData({ ...formData, radius: parseInt(e.target.value) })}
            className="w-full" />
        </div>
        <div className="flex space-x-2">
          <button type="button" onClick={onBack} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
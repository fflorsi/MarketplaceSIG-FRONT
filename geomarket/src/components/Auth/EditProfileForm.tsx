import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { parseAnyCoordinates, reverseGeocode } from '../../utils/geocoding';
import { updateUser as apiUpdateUser } from '../../api/backend';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const EditProfileForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, updateUser } = useApp();
  const user = state.auth.user;
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '', // Solo para el input, no se guarda en el backend
    radius: user?.radius || 5,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);


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
  useEffect(() => {
    if (user?.coordinates) {
      const { lat, lng } = parseAnyCoordinates(user.coordinates);
      setMarkerPosition([lat, lng]);
    }
  }, [user?.coordinates]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (user?.coordinates) {
        const { lat, lng } = parseAnyCoordinates(user.coordinates);
        const address = await reverseGeocode(lat, lng);
        setFormData(f => ({ ...f, address }));
      }
    };
    fetchAddress();
  }, [user?.coordinates]);

  if (!user) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name || !formData.email || !formData.address) {
    setError('Completa todos los campos');
    return;
  }
  setLoading(true);
  try {
    // NO geocodifiques aquí, solo manda la dirección
    const response = await apiUpdateUser(user.id, {
      name: formData.name,
      email: formData.email,
      address: formData.address, // Enviar la dirección
      radius: formData.radius,
    });

    // El backend devolverá el usuario actualizado con coordinates
    const updatedUser = {
      ...user,
      name: response.user.name,
      email: response.user.email,
      address: formData.address,
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
        <div>
          <label className="block mb-1">Dirección</label>
          <input className="w-full border rounded p-2" value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1">Radio de Interés (km)</label>
          <input type="number" min={1} max={50} className="w-full border rounded p-2"
            value={formData.radius}
            onChange={e => setFormData({ ...formData, radius: parseInt(e.target.value) })} />
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
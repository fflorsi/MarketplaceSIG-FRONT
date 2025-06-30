import React, { useState } from 'react';
import { CheckCircle, XCircle, Mail, Store, Users, Package } from 'lucide-react';
import { listShops, listProductsByShop, sendOffers, updateShop, listUsers } from '../../api/backend';

const AdminPanel: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Nuevo estado
  const pendingStores = stores.filter(store => store.state === 'pending');
  const approvedStores = stores.filter(store => store.approved);
  const totalProducts = products.length;
  const totalOffers = products.filter(p => p.hasDiscount).length;
  const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
  
  const storeOwners = uniqueUsers.filter(u => u.type === 'owner');
  const customers = uniqueUsers.filter(u => u.type === 'client');

  console.log('Unique users:', uniqueUsers, customers, storeOwners);

  React.useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Adaptar tiendas
      const rawShops = await listShops();
      const shops = rawShops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        coordinates: shop.coordinates,
        ownerId: shop.user_id ?? shop.ownerId,
        approved: shop.status === 'accepted' || shop.approved,
        state: shop.state ?? shop.status ?? 'pending', 
        address: shop.address ?? '',
        description: shop.description ?? ''
      }));
      setStores(shops);

      // Cargar productos de todas las tiendas en paralelo
      const productsArrays = await Promise.all(
        shops.map(async (shop) => {
          const rawProducts = await listProductsByShop(shop.id);
          return rawProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            hasDiscount: p.has_discount ?? p.hasDiscount ?? false,
            discountPrice: p.discount_price ?? p.discountPrice,
            storeId: p.shop_id ?? p.storeId ?? shop.id,
            description: p.description ?? '',
            image: p.image ?? ''
          }));
        })
      );
      setProducts(productsArrays.flat());

      // Cargar TODOS los usuarios solo si no están en el estado
      if (users.length === 0) {
        const allUsers = await listUsers();
        setUsers(allUsers);
      }
    } catch (err) {
      alert('Error cargando datos del backend' + err);
    }
    setLoading(false);
  };
  fetchData();
  // eslint-disable-next-line
}, []);


const handleApproveStore = async (storeId: number) => {
  try {
    await updateShop(storeId, { approved: true, status: 'accepted', state: 'accepted' }); // <-- Añade state
    setStores(stores =>
      stores.map(s =>
        s.id === storeId
          ? { ...s, approved: true, status: 'accepted', state: 'accepted' } // <-- Y aquí
          : s
      )
    );
  } catch (err) {
    alert('Error al aprobar tienda' + err);
  }
};

const handleRejectStore = async (storeId: number) => {
  try {
    await updateShop(storeId, { approved: false, status: 'cancelled', state: 'declined' });
    setStores(stores =>
      stores.map(s =>
        s.id === storeId
          ? { ...s, approved: false, status: 'cancelled', state: 'declined' } 
          : s
      )
    );
  } catch (err) {
    alert('Error al rechazar tienda' + err);
  }
};
  const sendMassEmail = async () => {
    try {
      await sendOffers();
      setSuccessMessage(`¡Email masivo enviado a ${customers.length} clientes con ${totalOffers} ofertas disponibles!`);
      setTimeout(() => setSuccessMessage(null), 4000); // Oculta el mensaje tras 4s
    } catch (err) {
      alert('Error al enviar emails masivos'+err);
    }
    setShowEmailModal(false);
  };

  if (loading) return <div className="p-6">Cargando datos...</div>;

  return (
    <div className="p-6">
      {/* Mensaje de éxito flotante */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-2">Panel de Administración</h2>
        <p className="text-gray-600">Gestiona tiendas, usuarios y campañas de marketing</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-secondary mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{approvedStores.length}</p>
              <p className="text-gray-600 text-sm">Tiendas Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-accent mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{totalProducts}</p>
              <p className="text-gray-600 text-sm">Productos Totales</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{customers.length}</p>
              <p className="text-gray-600 text-sm">Clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-dark mr-3" />
            <div>
              <p className="text-2xl font-bold text-dark">{totalOffers}</p>
              <p className="text-gray-600 text-sm">Ofertas Activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mass Email Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-dark">Campaña de Email Masiva</h3>
            <p className="text-gray-600 text-sm">
              Envía todas las ofertas disponibles a los clientes en su radio de interés
            </p>
          </div>
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Enviar Email Masivo</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-dark">Clientes Objetivo</div>
            <div className="text-gray-600">{customers.length} usuarios registrados</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-dark">Ofertas Disponibles</div>
            <div className="text-gray-600">{totalOffers} productos con descuento</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-dark">Tiendas Participantes</div>
            <div className="text-gray-600">
              {stores.filter(s => s.approved && products.some(p => p.storeId === s.id && p.hasDiscount)).length} tiendas
            </div>
          </div>
        </div>
      </div>

      {/* Pending Store Approvals */}
      {pendingStores.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Tiendas Pendientes de Aprobación ({pendingStores.length})
          </h3>
          <div className="space-y-4">
              {pendingStores.map(store => {
                const owner = users.find(u => u.id === store.ownerId);
                return (
                  <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                      <h4 className="font-semibold text-dark">{store.name}</h4>
                      <p className="text-gray-600 text-sm">{store.address}</p>
                      {store.description && (
                        <p className="text-gray-500 text-sm mt-1">{store.description}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        Propietario: {owner?.name} ({owner?.email})
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApproveStore(store.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleRejectStore(store.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Users Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Dueños de Tiendas</h3>
          <div className="space-y-3">
            {storeOwners.map(owner => {
              const ownerStores = stores.filter(s => s.ownerId === owner.id);
              const approvedStoresCount = ownerStores.filter(s => s.approved).length;
              return (
                <div key={owner.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-dark">{owner.name}</div>
                    <div className="text-sm text-gray-600">{owner.email}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-dark">{approvedStoresCount} tiendas activas</div>
                    <div className="text-gray-500">{ownerStores.length - approvedStoresCount} pendientes</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Clientes</h3>
          <div className="space-y-3">
            {customers.map(customer => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-dark">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-dark">Radio: {customer.radius}km</div>
                  <div className="text-gray-500">{customer.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Confirmation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark mb-4">Confirmar Envío de Email Masivo</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres enviar un email con todas las ofertas disponibles 
              a {customers.length} clientes registrados?
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="text-sm space-y-1">
                <div>• {totalOffers} ofertas serán incluidas</div>
                <div>• Los clientes recibirán solo ofertas de tiendas en su radio</div>
                <div>• El email será enviado inmediatamente</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={sendMassEmail}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors"
              >
                Enviar Emails
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
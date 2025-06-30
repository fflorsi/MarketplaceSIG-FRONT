import React from 'react';
import { MapPin, LogOut, User, ShoppingBag, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onEditProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onEditProfile }) => {
  const { state, logout } = useApp();
  const { user } = state.auth;

  if (!user) return null;

  const getNavItems = () => {
    const baseItems = [
      { id: 'map', label: 'Mapa', icon: MapPin },
      { id: 'stores', label: 'Tiendas', icon: ShoppingBag }
    ];

    if (user.type === 'owner') {
      baseItems.push({ id: 'my-stores', label: 'Mis Tiendas', icon: ShoppingBag });
    }

    if (user.type === 'admin') {
      baseItems.push({ id: 'admin', label: 'Admin', icon: Settings });
    }

    return baseItems;
  };

  return (
    <>
      <header className="bg-white shadow-md border-b-2 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-dark">GeoMarket</h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              {getNavItems().map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'text-primary bg-light'
                        : 'text-dark hover:text-primary hover:bg-light'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-dark">
                <button
                  onClick={onEditProfile}
                  className="focus:outline-none"
                  title="Editar perfil"
                >
                  <User className="h-4 w-4 hover:text-primary transition-colors" />
                </button>
                <span>{user.name}</span>
                <span className="px-2 py-1 bg-secondary text-white rounded-full text-xs">
                  {user.type === 'admin' ? 'Admin' : user.type === 'owner' ? 'Dueño' : 'Cliente'}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-primary hover:text-primary-hover transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
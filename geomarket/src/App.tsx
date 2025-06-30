import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import LandingPage from './components/Landing/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import MapView from './components/Map/MapView';
import StoreList from './components/Stores/StoreList';
import MyStores from './components/Owner/MyStores';
import AdminPanel from './components/Admin/AdminPanel';
import EditProfileForm from './components/Auth/EditProfileForm';


const AppContent: React.FC = () => {
  const { state } = useApp();
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState('map');
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Mostrar landing page si no está autenticado y showLanding es true
  if (!state.auth.isAuthenticated && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Mostrar formularios de auth si no está autenticado
  if (!state.auth.isAuthenticated) {
    return authMode === 'login' 
      ? <LoginForm onToggleMode={() => setAuthMode('register')} />
      : <RegisterForm onToggleMode={() => setAuthMode('login')} />;
  }

  if (showEditProfile) {
    return <EditProfileForm onBack={() => setShowEditProfile(false)} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return <MapView />;
      case 'stores':
        return <StoreList />;
      case 'my-stores':
        return <MyStores />;
      case 'admin':
        return <AdminPanel />;
      case 'edit-profile':
        return <EditProfileForm onBack={() => setCurrentView('map')} />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} onEditProfile={() => setCurrentView('edit-profile')} />
      <main className="pt-4">
        {renderCurrentView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
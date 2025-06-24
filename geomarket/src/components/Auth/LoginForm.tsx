import React, { useState } from 'react';
import { LogIn, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

import * as api from '../../api/backend.ts';


interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { state, login } = useApp(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      const loginResponse = await api.login(email, password);
      const userProfile = await api.getProfile(loginResponse.user_id);
      login(userProfile); 
    } catch (err) {
      setError('Email o contraseña incorrectos' + err); //quitar esto depsues!!!!!!!!!!!!!!!!!!!!!
    }
  };

  const demoAccounts = [
    { email: 'admin@marketplace.com', password: 'admin123', type: 'Administrador' },
    { email: 'maria@email.com', password: 'maria123', type: 'Dueña de Tienda' },
    { email: 'juan@email.com', password: 'juan123', type: 'Cliente' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-accent flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-dark">GeoMarket</h2>
          <p className="mt-2 text-sm text-dark/70">
            Marketplace con geolocalización
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
              <label htmlFor="email" className="block text-sm font-medium text-dark">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:text-primary-hover text-sm font-medium"
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>


      </div>
    </div>
  );
};

export default LoginForm;
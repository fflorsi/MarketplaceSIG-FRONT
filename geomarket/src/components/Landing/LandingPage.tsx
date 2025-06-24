import React from 'react';
import { MapPin, Store, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: MapPin,
      title: 'Geolocalización Inteligente',
      description: 'Encuentra tiendas y ofertas cerca de tu ubicación con precisión GPS'
    },
    {
      icon: Store,
      title: 'Marketplace Completo',
      description: 'Plataforma integral para dueños de tiendas y clientes'
    },
    {
      icon: Users,
      title: 'Comunidad Conectada',
      description: 'Conecta comerciantes locales con clientes de su zona'
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Sistema de aprobación y verificación de tiendas'
    }
  ];

  const benefits = [
    'Descubre ofertas exclusivas en tu área',
    'Apoya el comercio local de tu zona',
    'Recibe notificaciones de promociones cercanas',
    'Interfaz intuitiva y fácil de usar'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <MapPin className="relative h-20 w-20 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6">
              <span className="text-primary">Geo</span>Market
            </h1>
            
            <p className="text-xl md:text-2xl text-dark/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              El marketplace que conecta comerciantes y clientes a través de la 
              <span className="text-primary font-semibold"> geolocalización inteligente</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="group bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Comenzar Ahora</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center space-x-2 text-secondary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Registro gratuito</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              ¿Por qué elegir GeoMarket?
            </h2>
            <p className="text-lg text-dark/70 max-w-2xl mx-auto">
              Una plataforma diseñada para revolucionar el comercio local mediante la tecnología de geolocalización
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group text-center p-6 rounded-xl bg-gradient-to-br from-light/50 to-white border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">{feature.title}</h3>
                  <p className="text-dark/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-r from-secondary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
                Descubre el comercio local como nunca antes
              </h2>
              <p className="text-lg text-dark/70 mb-8 leading-relaxed">
                GeoMarket te permite encontrar las mejores ofertas y productos en tiendas cercanas a tu ubicación, 
                apoyando el comercio local y descubriendo nuevas oportunidades en tu zona.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-dark font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-dark">Electrónica Premium</div>
                      <div className="text-sm text-dark/60">2.3 km de distancia</div>
                    </div>
                  </div>
                  <div className="bg-light/50 rounded-lg p-4">
                    <div className="text-sm text-dark/70 mb-2">Oferta especial</div>
                    <div className="font-bold text-primary text-lg">30% OFF en smartphones</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-primary-hover">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Únete a nuestra comunidad y descubre un nuevo mundo de oportunidades comerciales locales
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-light transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Crear Cuenta Gratuita
          </button>
          
          <div className="mt-6 text-white/80 text-sm">
            Sin compromisos • Configuración en minutos • Soporte completo
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-white">GeoMarket</span>
          </div>
          <p className="text-white/70">
            Conectando comerciantes y clientes a través de la geolocalización inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
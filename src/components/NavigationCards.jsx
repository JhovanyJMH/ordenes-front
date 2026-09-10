import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import usuariosImage from '../images/Usuarios.jpg';

const NavigationCards = () => {
  const { user } = useSelector(state => state.auth);

  const cards = [
   

  ];

  const filteredCards = cards.filter(card => {
    // Perfil 3: solo puede ver Inventario Rentado
    if (user?.profile === '3') {
      return card.link === '/inventarios/rentado';
    }
    // Si la tarjeta especifica un perfil, solo ese perfil la ve (p.ej. Usuarios -> '1')
    if (card.showForProfile) {
      return user?.profile === card.showForProfile;
    }
    // Por defecto visible
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredCards.map((card, index) => (
        <Link
          key={index}
          to={card.link}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-48">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NavigationCards; 
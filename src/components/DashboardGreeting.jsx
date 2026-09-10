import React from 'react';
import { useSelector } from 'react-redux';
import NavigationCards from './NavigationCards';

const DashboardGreeting = () => {
  const hours = new Date().getHours();
  let greetings = '';

  if (hours >= 6 && hours <= 11) {
    greetings = 'Buenos días';
  } else if (hours > 11 && hours <= 18) {
    greetings = 'Buenas tardes';
  } else {
    greetings = 'Buenas noches';
  }

  const { user } = useSelector(state => state.auth);

  return (
    <div className="relative bg-orange-100 p-4 sm:p-6 rounded-sm overflow-hidden mb-8">
      {/* Background illustration: Laptop SVG */}
      <div className="absolute right-0 top-5 -mt-4 mr-16 pointer-events-none hidden xl:block" aria-hidden="true">
        
      </div>

      {/* Content */}
      <div className="relative">
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-1">{greetings}, {user?.name}. 👋</h1>
        <p>¿Qué es lo que vamos a hacer hoy?</p>
      </div>

      <NavigationCards />
      {user?.profile === '1' && (
        <>
         
        </>
      )}
    </div>
  );
};

export default DashboardGreeting; 
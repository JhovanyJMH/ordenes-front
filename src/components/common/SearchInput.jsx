import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Actualizar el valor del input cuando cambia el prop value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce para evitar demasiadas llamadas a la API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Llamar a onChange cuando el valor debounceado cambia
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput; 
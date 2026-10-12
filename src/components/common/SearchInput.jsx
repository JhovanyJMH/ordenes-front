import React, { useEffect, useRef, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  className = '',
  debounceMs = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState(value ?? '');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setSearchTerm(value ?? '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current?.(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <FaSearch className="h-4 w-4 text-[#8A2036]/70" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && searchTerm) {
            event.preventDefault();
            handleClear();
          }
        }}
        className="block w-full rounded-xl border border-[#e8d4d7] bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20"
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
      />
      {searchTerm ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-[#8A2036]"
          aria-label="Limpiar búsqueda"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
};

export default SearchInput;

import React from 'react';

const Pagination = ({ currentPage, lastPage, total, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const pagesToShow = 5; // Número de páginas a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + pagesToShow - 1);

    // Ajustar startPage y endPage si están en los límites
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    // Agregar primera página y elipsis si es necesario
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Agregar páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Agregar última página y elipsis si es necesario
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push('...');
      }
      pages.push(lastPage);
    }

    return pages;
  };

  if (lastPage <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> a{' '}
        <span className="font-medium">{Math.min(currentPage * 10, total)}</span> de{' '}
        <span className="font-medium">{total}</span> resultados
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Anterior
        </button>

        {renderPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page !== 'number'}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination; 
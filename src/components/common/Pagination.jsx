const Pagination = ({
  currentPage,
  lastPage = 1,
  from = 0,
  to = 0,
  total = 0,
  onPageChange,
  loading = false,
}) => {
  const pagesToShow = typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 10;
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(lastPage, startPage + pagesToShow - 1);

  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  const pages = [];
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }
  for (let i = startPage; i <= endPage; i += 1) {
    pages.push(i);
  }
  if (endPage < lastPage) {
    if (endPage < lastPage - 1) pages.push('...');
    pages.push(lastPage);
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-center text-sm text-gray-600 sm:text-left">
        Mostrando <span className="font-medium">{from || 0}</span> a <span className="font-medium">{to || 0}</span> de{' '}
        <span className="font-medium">{total || 0}</span> resultados
      </div>

      {lastPage > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
          >
            Anterior
          </button>

          {pages.map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number' || currentPage === page || loading}
              className={`rounded-md px-2 py-1 text-sm sm:px-3 ${
                typeof page === 'number'
                  ? currentPage === page
                    ? 'bg-colorPrimario text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'cursor-default border border-gray-300 bg-white text-gray-700 opacity-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage || loading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

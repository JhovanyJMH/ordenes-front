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
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#f3e3e1] bg-[#fffdfd] px-3 py-3 shadow-sm sm:flex-row sm:px-4">
      <p className="text-sm font-medium text-gray-600">
        Mostrando {from || 0} a {to || 0} de {total || 0}
      </p>
      {lastPage > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            Anterior
          </button>
          {pages.map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number' || currentPage === page || loading}
              className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition sm:px-3 ${
                typeof page === 'number'
                  ? currentPage === page
                    ? 'bg-[#8A2036] text-white shadow-md shadow-[#8A2036]/20'
                    : 'border border-[#e8d3d4] bg-white text-gray-700 hover:border-[#8A2036]/30 hover:text-[#8A2036]'
                  : 'cursor-default border border-transparent bg-transparent text-gray-400'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage || loading}
            className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

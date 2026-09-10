import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';

export const SearchBar = ({ showButton = true, onSearch, currentPage = 1 }) => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.profile === '1';

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      onSearch(searchValue.toUpperCase());
    }
  };

  const handleChange = (event) => {
    const upperValue = event.target.value.toUpperCase();
    setSearchValue(upperValue);
  };

  const handleCheckEmpty = (event) => {
    if (event.target.value === '') {
      setSearchValue('');
      onSearch('');
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4">
        <div className="dropdown relative w-full md:w-auto">
          <div className="flex items-center w-full md:w-auto">
            {isAdmin && (
              <Link
                to="registrar"
                state={{ fromPage: currentPage }}
                type="button"
                className={`btn ${showButton ? 'hidden' : ''} w-32 text-colorPrimario hover:text-white border-2 border-colorPrimario hover:bg-colorPrimario focus:ring-2 focus:outline-none focus:ring-colorSecundario font-medium rounded-lg px-5 py-2.5 text-center text-xl mr-2 mb-2 flex items-center justify-center gap-2`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Nuevo
              </Link>
            )}
          </div>
        </div>
        <div className="relative w-full md:w-auto">
          <div className="relative z-0 mb-6 w-full group">
            <input
              value={searchValue}
              onKeyUp={handleSearch}
              onChange={(e) => {
                handleChange(e);
                handleCheckEmpty(e);
              }}
              type="text"
              name="table-search"
              id="table-search"
              className="block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-colorPrimario peer"
              placeholder=" "
              required=""
            />
            <label
              htmlFor="table-search"
              className="peer-focus:font-medium absolute text-lg text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-colorPrimario peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Buscar
            </label>
          </div>
        </div>
      </div>
    </>
  );
}; 
export const TABLE_WRAP =
  'overflow-hidden rounded-2xl border border-[#f1dfe2] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f6e4e8]';
export const TABLE_CLASS = 'min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm';
export const THEAD_CLASS =
  'bg-gradient-to-r from-[#8A2036] via-[#9b2740] to-[#a9304a] text-xs font-bold uppercase tracking-[0.14em] text-white';
export const TH_CLASS = 'px-3 py-3 text-left sm:px-4';
export const TR_CLASS = 'transition-colors duration-200 odd:bg-white even:bg-[#fffaf8] hover:bg-[#fff3f2]';
export const TD_CLASS = 'px-3 py-3 sm:px-4';

const TableShell = ({ children }) => (
  <div className={TABLE_WRAP}>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export default TableShell;

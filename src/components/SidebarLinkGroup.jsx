import React, { useState, useEffect } from 'react';

function SidebarLinkGroup({ children, activecondition, bloqueo = false }) {
  const [open, setOpen] = useState(activecondition);

  useEffect(() => {
    setOpen(activecondition);
  }, [activecondition]);

  const handleClick = () => {
    if (!bloqueo) {
      setOpen(!open);
    }
  };

  return (
    <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${activecondition && 'bg-colorAuxiliar'}`}>
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup; 
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
    <li className="mb-0.5 last:mb-0">
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup; 
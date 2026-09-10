import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);

  if (user?.profile !== '1') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canAccessDocumentosModulos } from '../utils/access';

const BdOfficeRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);

  if (!canAccessDocumentosModulos(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default BdOfficeRoute;

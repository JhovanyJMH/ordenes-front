import { useParams } from 'react-router-dom';
import SistemaPrincipalForm from './SistemaPrincipalForm';

const SistemaPrincipalEdit = () => {
  const { id } = useParams();
  return <SistemaPrincipalForm mode="edit" editId={id} />;
};

export default SistemaPrincipalEdit;

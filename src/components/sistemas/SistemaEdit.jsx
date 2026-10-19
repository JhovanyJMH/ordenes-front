import { useParams } from 'react-router-dom';
import SistemaForm from './SistemaForm';

const SistemaEdit = () => {
  const { id } = useParams();
  return <SistemaForm mode="edit" editId={id} />;
};

export default SistemaEdit;

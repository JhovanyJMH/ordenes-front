import { useSelector } from 'react-redux';
import DashboardGreeting from '../components/DashboardGreeting';
import DashboardStats from '../components/dashboard/DashboardStats';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-8">
      <DashboardGreeting name={user?.name || 'ADMINISTRADOR'} />
      <DashboardStats />
    </div>
  );
};

export default DashboardPage;

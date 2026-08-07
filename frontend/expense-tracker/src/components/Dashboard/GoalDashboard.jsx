import { useState } from 'react';
import GoalDashboardCard from '../Cards/GoalDashboardCard';

const GoalDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  return <>{dashboard && <GoalDashboardCard dashboard={dashboard} />}</>;
};

export default GoalDashboard;

import { useEffect, useState } from 'react';
import GoalDashboardCard from '../Cards/GoalDashboardCard';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const GoalDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGoalDashboard = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get(API_PATHS.GOALS.DASHBOARD_INFO);

      if (response.data?.dashboard) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error('Failed to load goal dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-full animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-5 w-16 rounded bg-gray-200 dark:bg-slate-700" />
        </div>

        <div className="h-24 rounded-xl bg-gray-200 dark:bg-slate-700" />

        <div className="mt-5 space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-slate-700" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-16 rounded-xl bg-gray-200 dark:bg-slate-700" />
          <div className="h-16 rounded-xl bg-gray-200 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  return <>{dashboard && <GoalDashboardCard dashboard={dashboard} />}</>;
};

export default GoalDashboard;

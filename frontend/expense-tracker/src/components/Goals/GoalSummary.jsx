import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Target,
  CheckCircle,
  DollarSign,
  PieChart,
  Archive,
  Wallet,
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

const GoalSummary = ({ refreshKey }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.GOALS.GET_GOAL_SUMMARY);
      setSummary(response.data.summary);
      setError(null);
    } catch (err) {
      toast.error('Failed to load summary');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-500 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-8">
        Unable to load summary
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Goals',
      value: summary.totalGoals,
      icon: <Target size={20} className="text-amber-600" />,
      color: 'bg-amber-50',
    },
    {
      title: 'Active Goals',
      value: summary.activeGoals,
      icon: <TrendingUp size={20} className="text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Completed',
      value: summary.completedGoals,
      icon: <CheckCircle size={20} className="text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Archived',
      value: summary.archivedGoals,
      icon: <Archive size={20} className="text-gray-600" />,
      color: 'bg-gray-50',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-lg p-4 border border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-4 grid grid-cols md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Target Amount</span>
            <PieChart size={18} className="text-amber-700 dark:text-amber-200" />
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-200 mt-1">
            GHS {summary.totalTarget.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Saved Amount</span>
            <Wallet size={18} className="text-amber-700 dark:text-amber-200" />
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-200 mt-1">
            GHS {summary.totalSaved.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Remaining to Save</span>
            <DollarSign size={18} className="text-amber-700 dark:text-amber-200" />
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-200 mt-1">
            GHS {summary.remaining.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</span>
            <TrendingUp size={18} className="text-amber-700 dark:text-amber-200" />
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-200 mt-1">
            {summary.totalGoals > 0
              ? Math.round((summary.completedGoals / summary.totalGoals) * 100)
              : 0}
            %
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  summary.totalGoals > 0 ? (summary.completedGoals / summary.totalGoals) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;

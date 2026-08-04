import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, CheckCircle, DollarSign, PieChart } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const GoalSummary = ({ onUpdate }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [onUpdate]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.GOALS.GET_GOAL_SUMMARY);
      setSummary(response.data.summary);
      setError(null);
    } catch (err) {
      setError('Failed to load summary');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
      icon: <Target size={20} className="text-blue-600" />,
      color: 'bg-blue-50',
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
      title: 'Total Saved',
      value: `$${summary.totalSaved.toLocaleString()}`,
      icon: <DollarSign size={20} className="text-yellow-600" />,
      color: 'bg-yellow-50',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-xl p-4 border border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Target Amount</span>
            <PieChart size={18} className="text-gray-400" />
          </div>
          <div className="text-xl font-semibold text-gray-900 mt-1">
            ${summary.totalTarget.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Remaining to Save</span>
            <DollarSign size={18} className="text-gray-400" />
          </div>
          <div className="text-xl font-semibold text-gray-900 mt-1">
            ${summary.remaining.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Completion Rate</span>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          <div className="text-xl font-semibold text-gray-900 mt-1">
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

import { TrendingUp, CheckCircle, Clock } from 'lucide-react';

const GoalProgress = ({ goal }) => {
  const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const isCompleted = goal.status === 'completed';
  const isActive = goal.status === 'active';

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (progress >= 75) return 'bg-amber-600';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-amber-400';
    return 'bg-amber-300';
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        icon: <CheckCircle size={16} className="text-green-600" />,
        text: 'Completed! 🎉',
        color: 'text-green-600',
      };
    }
    if (isActive) {
      const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        return {
          icon: <Clock size={16} className="text-red-600" />,
          text: 'Overdue',
          color: 'text-red-600',
        };
      }
      return {
        icon: <TrendingUp size={16} className="text-amber-600" />,
        text: `${daysLeft} days left`,
        color: 'text-amber-600',
      };
    }
    return {
      icon: <Clock size={16} className="text-gray-600" />,
      text: 'Archived',
      color: 'text-gray-600',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Amount Info */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">${goal.savedAmount.toLocaleString()} saved</span>
        <span className="text-gray-500">${goal.targetAmount.toLocaleString()} target</span>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-1 text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.icon}
        <span>{statusInfo.text}</span>
      </div>

      {/* Remaining Amount */}
      {isActive && !isCompleted && (
        <div className="text-xs text-gray-500">
          Remaining: ${(goal.targetAmount - goal.savedAmount).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default GoalProgress;

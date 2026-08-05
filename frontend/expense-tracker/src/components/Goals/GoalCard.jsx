import { useState } from 'react';
import { TrendingUp, Calendar, Target, Edit, Trash2, Plus, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

const GoalCard = ({ goal, onUpdate, onDelete, onEdit }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isCompleted = goal.status === 'completed';
  const isActive = goal.status === 'active';

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={16} className="text-green-600" />,
        };
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock size={16} className="text-gray-600" />,
        };
      default:
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: <TrendingUp size={16} className="text-amber-600" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  const handleUpdateSavings = async (type) => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const updateAmount = type === 'add' ? numericAmount : -numericAmount;

    try {
      setIsUpdating(true);
      await axiosInstance.patch(API_PATHS.GOALS.UPDATE_SAVED_AMOUNT(goal._id), {
        amount: updateAmount,
      });
      setAmount('');
      setShowAmountInput(false);
      setError(null);
      onUpdate?.();
    } catch (err) {
      toast.error('Failed to update savings. Please try again.');
      console.error('Error updating savings:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{goal.icon || '🎯'}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color} mt-1`}
              >
                {statusBadge.icon}
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAmountInput(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Update savings"
            >
              <Plus size={18} className="text-amber-600" />
            </button>
            <button
              onClick={() => onEdit?.()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => onDelete?.()}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-600' : 'bg-amber-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Saved</p>
            <p className="text-lg font-semibold text-gray-900">
              ${goal.savedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Target</p>
            <p className="text-lg font-semibold text-gray-900">
              ${goal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
          </div>
          {isActive && daysLeft > 0 && (
            <div className="flex items-center gap-1">
              <Target size={16} />
              <span>{daysLeft} days left</span>
            </div>
          )}
          {isActive && daysLeft <= 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <Target size={16} />
              <span>Overdue</span>
            </div>
          )}
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-gray-600 border-t border-gray-100 pt-4">{goal.description}</p>
        )}

        {/* Error Message */}
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

        {/* Update Savings Input */}
        {showAmountInput && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={isUpdating}
                min="0"
                step="0.01"
                autoFocus
              />
              <button
                onClick={() => handleUpdateSavings('add')}
                className="add-btn add-btn-fill px-3 py-2"
                disabled={isUpdating}
              >
                Add
              </button>
              <button
                onClick={() => handleUpdateSavings('remove')}
                className="add-btn px-3 py-2 text-red-600 border-red-600 bg-red-50 hover:text-red-700 dark:text-red-400"
                disabled={isUpdating || goal.savedAmount === 0}
              >
                Remove
              </button>
              <button
                onClick={() => {
                  setShowAmountInput(false);
                  setAmount('');
                  setError(null);
                }}
                className="add-btn px-3 py-2"
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;

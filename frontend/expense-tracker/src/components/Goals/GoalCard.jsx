import { useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp, Calendar, Target, Edit, Trash2, Plus, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import Input from '../Inputs/Input';
import { FiMoreVertical } from 'react-icons/fi';
import { Archive } from 'lucide-react';

const GoalCard = ({ goal, onUpdate, onDelete, onEdit, isSavingsOpen, onToggleSavingsInput }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);

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

  const remainingAmount = useMemo(
    () => Math.max(goal.targetAmount - goal.savedAmount, 0),
    [goal.savedAmount, goal.targetAmount]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overagePreview = useMemo(() => {
    if (!amount) {
      return null;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return null;
    }

    const overage = Math.max(numericAmount - remainingAmount, 0);

    if (overage > 0) {
      return {
        overage,
        remaining: remainingAmount,
        newProgress: Math.min(((goal.savedAmount + numericAmount) / goal.targetAmount) * 100, 100),
      };
    }

    return null;
  }, [amount, goal.savedAmount, goal.targetAmount, remainingAmount]);

  const isArchived = goal.status === 'archived';

  const handleToggleArchive = async () => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.patch(API_PATHS.GOALS.ARCHIVE_GOAL(goal._id));
      setShowActionMenu(false);
      toast.success(
        response.data?.message ||
          (isArchived ? 'Goal restored successfully.' : 'Goal archived successfully.')
      );

      onUpdate?.(response.data.goal);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update goal.');
    } finally {
      setIsUpdating(false);
    }
  };

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
      const response = await axiosInstance.patch(API_PATHS.GOALS.UPDATE_SAVED_AMOUNT(goal._id), {
        amount: updateAmount,
      });
      setAmount('');
      setError(null);
      toast.success(response.data?.message || 'Savings updated successfully.');
      onToggleSavingsInput?.();
      onUpdate?.(response.data?.goal || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update savings. Please try again.';
      setError(message);
      toast.error(message);
      console.error('Error updating savings:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-500 hover:shadow-md transition-shadow"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-amber-50 text-xl">
              {goal.icon ? <img src={goal.icon} alt={goal.title} className="w-8 h-8" /> : '🎯'}
            </div>
            <div>
              <h3 className="text-md md:text-lg font-medium text-gray-900 dark:text-gray-200">
                {goal.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color} mt-1`}
              >
                {statusBadge.icon}
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2" ref={actionMenuRef}>
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionMenu((prev) => !prev);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="More actions"
              >
                <FiMoreVertical size={18} className="text-gray-600 dark:text-gray-200" />
              </button>

              {showActionMenu && (
                <div className="absolute right-0 top-8 z-20 w-35 rounded-lg border border-gray-200 dark:border-gray-500 bg-white dark:bg-slate-700 shadow-lg">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionMenu(false);
                      setError(null);
                      onToggleSavingsInput?.();
                    }}
                    className="flex w-full items-center gap-1 px-3 py-1 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <Plus size={15} className="text-amber-600 " />
                    Update savings
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionMenu(false);
                      onEdit?.();
                    }}
                    className="flex w-full items-center gap-1 px-3 py-1 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    <Edit size={13} className="text-gray-600 dark:text-gray-300" />
                    Edit Goal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionMenu(false);
                      handleToggleArchive();
                    }}
                    className="flex w-full items-center gap-1 px-3 py-1 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                    disabled={isUpdating}
                  >
                    <Archive
                      size={13}
                      className={
                        goal.status === 'archived'
                          ? 'text-green-600'
                          : 'text-gray-600 dark:text-gray-300'
                      }
                    />
                    {goal.status === 'archived' ? 'Restore Goal' : 'Archive Goal'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionMenu(false);
                      onDelete?.();
                    }}
                    className="flex w-full items-center gap-1 px-3 py-2 text-left text-xs text-red-600 dark:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="hidden md:flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);

                  onToggleSavingsInput?.();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Update savings"
              >
                <Plus size={18} className="text-amber-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleArchive();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={goal.status === 'archived' ? 'Restore Goal' : 'Archive Goal'}
                disabled={isUpdating}
              >
                <Archive
                  size={16}
                  className={
                    goal.status === 'archived'
                      ? 'text-green-600'
                      : 'text-gray-600 dark:text-gray-300'
                  }
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
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
        <div className="flex gap-4 justify-between items-center">
          <div>
            <p className="text-xs text-gray-500  dark:text-gray-400">Saved</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
              GHS {goal.savedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500  dark:text-gray-400">Target</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
              GHS {goal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
          </div>
          {isActive && daysLeft > 0 && (
            <div className="flex items-center gap-1">
              <Target size={14} />
              <span>{daysLeft} days left</span>
            </div>
          )}
          {isActive && daysLeft <= 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <Target size={14} />
              <span>Overdue</span>
            </div>
          )}
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-500 pt-4">
            {goal.description}.
          </p>
        )}

        {/* Error Message */}
        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

        {/* Update Savings Input */}
        {isSavingsOpen && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="Enter amount"
                disabled={isUpdating}
                min="0"
                step="0.01"
                autoFocus
              />

              <button
                onClick={() => handleUpdateSavings('add')}
                className="add-btn add-btn-fill "
                disabled={isUpdating}
              >
                Add
              </button>
              <button
                onClick={() => handleUpdateSavings('remove')}
                className="add-btn add-btn-fill  "
                disabled={isUpdating || goal.savedAmount === 0}
              >
                Remove
              </button>
              <button
                onClick={() => {
                  onToggleSavingsInput?.();
                  setAmount('');
                  setError(null);
                }}
                className="add-btn add-btn-fill "
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>

            {overagePreview && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                <p className="">Remaining: GHS {remainingAmount.toFixed(2)}</p>
                <p className="mt-1">
                  ⚠️ You&apos;re adding GHS {overagePreview.overage.toFixed(2)} more than needed.
                </p>
                {/*  <p className="mt-1">
                  Progress would become {overagePreview.newProgress.toFixed(0)}%.
                </p> */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;

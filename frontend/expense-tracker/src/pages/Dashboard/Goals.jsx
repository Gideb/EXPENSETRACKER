import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import GoalCard from '../../components/Goals/GoalCard';
import AddGoalForm from '../../components/Goals/AddGoalForm';
import GoalSummary from '../../components/Goals/GoalSummary';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modals/Modal';
import DeleteAlert from '../../components/Modals/DeleteAlert';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSavingsGoalId, setActiveSavingsGoalId] = useState(null);
  const [openAddGoalModal, setOpenAddGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const fetchGoals = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get(API_PATHS.GOALS.GET_ALL_GOALS);
      const data = Array.isArray(response.data) ? response.data : response.data?.goals || [];
      setGoals(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load goals. Please try again.');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals, refreshKey]);

  const handleToggleSavingsInput = useCallback((goalId) => {
    setActiveSavingsGoalId((currentId) => (currentId === goalId ? null : goalId));
  }, []);

  const handleGoalUpdate = useCallback((updatedGoal) => {
    if (!updatedGoal?._id) {
      return;
    }

    setGoals((prevGoals) =>
      prevGoals.map((goal) => (goal._id === updatedGoal._id ? { ...goal, ...updatedGoal } : goal))
    );
  }, []);

  const groupedGoals = {
    active: goals.filter((goal) => goal.status === 'active'),
    completed: goals.filter((goal) => goal.status === 'completed'),
    archived: goals.filter((goal) => goal.status === 'archived'),
  };

  // handle Add Goal
  const handleAddGoal = async (goal) => {
    const { title, icon, targetAmount, targetDate, description } = goal;

    if (!title?.trim()) {
      toast.error('Please enter a goal title.');
      return;
    }

    if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0) {
      toast.error('Please enter a valid target amount greater than 0.');
      return;
    }

    if (!targetDate) {
      toast.error('Please select a target date.');
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.GOALS.CREATE_GOAL, {
        title: title.trim(),
        icon: icon || '',
        targetAmount: Number(targetAmount),
        targetDate,
        description: description || '',
      });

      setOpenAddGoalModal(false);
      toast.success('Goal Added Successfully');

      await fetchGoals();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to add goal.', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to add goal');
    }
  };

  // handle edit goal
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setOpenAddGoalModal(true);
  };

  // handle update Goal
  const handleUpdateGoal = async (goal) => {
    if (!editingGoal?._id) {
      toast.error('No goal selected for update');
      return;
    }

    try {
      await axiosInstance.put(API_PATHS.GOALS.UPDATE_GOAL(editingGoal._id), {
        title: goal.title,
        icon: goal.icon,
        targetAmount: Number(goal.targetAmount),
        targetDate: goal.targetDate,
        description: goal.description,
      });

      toast.success('Goal updated successfully');

      setEditingGoal(null);
      setOpenAddGoalModal(false);

      await fetchGoals();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('UPDATE ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to update goal');
    }
  };

  // delete Goal
  const deleteGoal = async (goalData) => {
    if (!goalData?._id) {
      toast.error('Invalid goal data');
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.GOALS.DELETE_GOAL(goalData._id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success(`${goalData.title || 'Goal'} record deleted successfully!`);

      await fetchGoals();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to delete goal entry.');
      toast.error(error.response?.data?.message || 'Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <Dashboardlayout activeMenu="Goals">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading goals...</div>
        </div>
      </Dashboardlayout>
    );
  }

  return (
    <Dashboardlayout activeMenu="Goals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Financial Goals</h1>
            <p className="text-gray-600 text-sm mt-1">Track and manage your savings goals</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setOpenAddGoalModal(true);
            }}
            className="add-btn add-btn-fill"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>

        {/* Summary Section */}
        <GoalSummary refreshKey={refreshKey} />

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">No goals yet</p>
            <p className="text-gray-500 mt-2">Start by creating your first financial goal</p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setOpenAddGoalModal(true);
              }}
              className="mt-4 add-btn add-btn-fill"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {['active', 'completed', 'archived'].map((section) => {
              const sectionGoals = groupedGoals[section];
              if (sectionGoals.length === 0) {
                return null;
              }

              const sectionTitle =
                section === 'active' ? 'Active' : section === 'completed' ? 'Completed' : 'Archived';

              return (
                <section key={section}>
                  <div className="mb-4 border-b border-gray-200 pb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{sectionTitle}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionGoals.map((goal) => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onUpdate={handleGoalUpdate}
                        onDelete={() => setOpenDeleteAlert({ show: true, data: goal })}
                        onEdit={() => handleEditGoal(goal)}
                        isSavingsOpen={activeSavingsGoalId === goal._id}
                        onToggleSavingsInput={() => handleToggleSavingsInput(goal._id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Add Goal Modal */}
        <Modal
          isOpen={openAddGoalModal}
          onClose={() => {
            setOpenAddGoalModal(false);
            setEditingGoal(null);
          }}
          title={editingGoal ? 'Edit Goal' : 'Add Goal'}
        >
          <AddGoalForm
            onGoalAdded={handleAddGoal}
            onGoalUpdated={handleUpdateGoal}
            editData={editingGoal}
          />
        </Modal>

        {/* goal deleted */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Goal"
        >
          <DeleteAlert
            content={`${openDeleteAlert.data?.title || 'This'} goal will be deleted forever.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              deleteGoal(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Goals;

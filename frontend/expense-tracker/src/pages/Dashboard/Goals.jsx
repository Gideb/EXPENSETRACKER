import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openAddGoalModal, setOpenAddGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  useEffect(() => {
    fetchGoals();
  }, [refreshKey]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.GOALS.GET_ALL_GOALS);
      setGoals(response.data.goals || []);

      toast.success('Goals loaded successfully');
      setError(null);
    } catch (err) {
      toast.error('Failed to load goals. Please try again.');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setOpenAddGoalModal(false);
  };

  const handleGoalUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleGoalDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleGoalEditing = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading goals...</div>
      </div>
    );
  }

  return (
    <Dashboardlayout activeMenu="Goals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-gray-600 mt-1">Track and manage your savings goals</p>
          </div>
          <button
            onClick={() => setOpenAddGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {/* Summary Section */}
        <GoalSummary onUpdate={handleGoalUpdated} refreshKey={refreshKey} />
        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">No goals yet</p>
            <p className="text-gray-500 mt-2">Start by creating your first financial goal</p>
            <button
              onClick={() => setOpenAddGoalModal(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onUpdate={handleGoalUpdated}
                onDelete={handleGoalDeleted}
              />
            ))}
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
            onGoalAdded={handleGoalAdded}
            onGoalUpdated={handleGoalUpdated}
            onGoalEdited={handleGoalEditing}
          />
        </Modal>

        {/* goal deleted */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Goal"
        >
          <DeleteAlert
            content={`${openDeleteAlert.data?.category || 'This'} goal will be deleted forever.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              handleGoalDeleted(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Goals;

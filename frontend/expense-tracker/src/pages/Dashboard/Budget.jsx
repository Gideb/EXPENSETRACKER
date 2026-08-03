import { useCallback, useEffect, useState } from 'react';
import AddBudgetForm from '../../components/Budget/AddBudgetForm';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../../components/Modals/Modal';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import BudgetList from '../../components/Budget/BudgetList';
import DeleteAlert from '../../components/Modals/DeleteAlert';
import BudgetSummary from '../../components/Budget/BudgetSummary';

const Budget = () => {
  useUserAuth();
  const [budgets, setBudgets] = useState([]);
  const [openAddBudgetModal, setOpenAddBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.BUDGET.BUDGET_CATEGORIES);

        const nextCategories = Array.isArray(response.data)
          ? response.data
          : response.data?.categories || [];

        setCategories(nextCategories);
      } catch (error) {
        console.log('Category fetch error', error);
      }
    };

    fetchCategories();
  }, []);

// get all Budget Details
  const fetchBudgets = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get(API_PATHS.BUDGET.GET_ALL_BUDGET);

      if (response.data) {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.budgets || response.data.data || [];
        setBudgets(data);
      }
    } catch (error) {
      console.error('Failed to load budgets:', error);
      toast.error(error.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  // handle Add Budget
  const handleAddBudget = async (budget) => {
    const { category, limitAmount, month, year, icon } = budget;

    if (!category?.trim()) {
      toast.error('Please enter a budget category.');
      return;
    }

    if (!limitAmount || isNaN(limitAmount) || Number(limitAmount) <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    if (!month) {
      toast.error('Please select a month.');
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.BUDGET.ADD_BUDGET, {
        category,
        limitAmount: Number(limitAmount),
        month,
        year: year || new Date().getFullYear(),
        icon: icon || '',
      });

      setOpenAddBudgetModal(false);
      toast.success('Budget Added Successfully');

      await fetchBudgets();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to add Budget.', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to add budget');
    }
  };

  // handle edit budget
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setOpenAddBudgetModal(true);
  };

  // handle update Budget
  const handleUpdateBudget = async (budget) => {
    if (!editingBudget?._id) {
      toast.error('No budget selected for update');
      return;
    }

    try {
      await axiosInstance.put(API_PATHS.BUDGET.UPDATE_BUDGET(editingBudget._id), {
        category: budget.category,
        limitAmount: Number(budget.limitAmount),
        month: budget.month,
        year: budget.year,
        icon: budget.icon,
      });

      toast.success('Budget updated successfully');

      setEditingBudget(null);
      setOpenAddBudgetModal(false);

      await fetchBudgets();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('UPDATE ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to update budget');
    }
  };

  // delete Budget
  const deleteBudget = async (budgetData) => {
    if (!budgetData?._id) {
      toast.error('Invalid budget data');
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.BUDGET.DELETE_BUDGET(budgetData._id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success(`${budgetData.category || 'Budget'} record deleted successfully!`);

      await fetchBudgets();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to delete budget entry.');
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return (
    <Dashboardlayout activeMenu="Budgets">
      <div className="budget-page ">
        <div className="flex justify-between items-center my-4"></div>

        <BudgetSummary setOpenAddBudgetModal={setOpenAddBudgetModal} refreshKey={refreshKey} />

        <BudgetList
          budgets={budgets}
          handleEditBudget={handleEditBudget}
          onDelete={(budget) => {
            setOpenDeleteAlert({ show: true, data: budget });
          }}
        />

        <Modal
          isOpen={openAddBudgetModal}
          onClose={() => {
            setOpenAddBudgetModal(false);
            setEditingBudget(null);
          }}
          title={editingBudget ? 'Edit Budget' : 'Add Budget'}
        >
          <AddBudgetForm
            categories={categories}
            onBudgetAdded={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            editData={editingBudget}
          />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Budget"
        >
          <DeleteAlert
            content={`${
              openDeleteAlert.data?.category || 'This'
            } budget entry will be deleted from your budget records.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              deleteBudget(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Budget;

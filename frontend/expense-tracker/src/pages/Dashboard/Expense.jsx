import { useEffect, useState } from "react";
import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import { toast } from "react-hot-toast";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // get all Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.GET_ALL_EXPENSES,
      );

      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.error(
        "Failed to load Expense details.",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  // handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    // validation checks
    if (!category.trim()) {
      toast.error("Please enter an expense category.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense Added Successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Failed to add Expense.",
        error.response?.data?.message || error.message,
      );
    }
  };

  //handle edit expense
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setOpenAddExpenseModal(true);
  };

  //handle update expense
  const handleUpdateExpense = async (expense) => {
    try {
      console.log("Editing Expense:", editingExpense);
      console.log("Payload:", expense);

      const response = await axiosInstance.put(
        API_PATHS.EXPENSE.UPDATE_EXPENSE(editingExpense._id),
        expense,
      );

      console.log("Success:", response.data);

      toast.success("Expense updated successfully");

      setEditingExpense(null);
      setOpenAddExpenseModal(false);

      await fetchExpenseDetails();
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      console.error("RESPONSE:", error.response);
      console.error("DATA:", error.response?.data);

      toast.error(error.response?.data?.message || "Failed to update expense");
    }
  };

  // delete Expense
  const deleteExpense = async (expense) => {
    if (!expense?._id) return;

    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(expense._id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success(
        `${openDeleteAlert.data?.category || "Expense"} record deleted successfully!`,
      );

      await fetchExpenseDetails();
    } catch (error) {
      console.error(
        error.response?.data?.message || "Failed to delete expense entry.",
      );
    }
  };

  // handle download Expense details
  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSES,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        error.response?.data?.message ||
          "Failed to download expense details. Please try again.",
      );
      toast.error("Failed to download expense data. Please try again");
    }
  };

  useEffect(() => {
    fetchExpenseDetails();

    return () => {};
  }, []);
  return (
    <Dashboardlayout activeMenu="Expense">
      <div className="space-y-6 my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            handleEditExpense={handleEditExpense}
            onDelete={(expense) => {
              setOpenDeleteAlert({ show: true, data: expense });
            }}
            onDownload={handleDownloadExpenseDetails}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => {
            setOpenAddExpenseModal(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? "Edit Expense" : "Add Expense"}
        >
          <AddExpenseForm
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            editData={editingExpense}
          />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content={` ${openDeleteAlert.data?.category || "This"} expense entry will be deleted from your expense records.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              deleteExpense(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Expense;

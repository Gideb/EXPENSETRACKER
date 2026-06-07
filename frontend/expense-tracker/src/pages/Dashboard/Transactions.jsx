import { useCallback, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from "react-hot-toast";
import TransactionList from "../../components/Transaction/TransactionList";
import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

const Transactions = () => {
  useUserAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  

  //get all transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSES),
      ]);

      const incomeData = Array.isArray(incomeResponse.data)
        ? incomeResponse.data.map((item) => ({ ...item, type: "income" }))
        : [];
      const expenseData = Array.isArray(expenseResponse.data)
        ? expenseResponse.data.map((item) => ({ ...item, type: "expense" }))
        : [];

      const mergedTransactions = [...incomeData, ...expenseData].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      setTransactions(mergedTransactions);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load transactions. Please refresh the page.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      await fetchTransactions();
    };

    void loadTransactions();
  }, [fetchTransactions]);

  // delete transaction
  const deleteTransaction = async (transaction) => {
    if (!transaction?._id) return;
    setError("");

    try {
      const endpoint =
        transaction.type === "expense"
          ? API_PATHS.EXPENSE.DELETE_EXPENSE(transaction._id)
          : API_PATHS.INCOME.DELETE_INCOME(transaction._id);

      await axiosInstance.delete(endpoint);
      setOpenDeleteAlert({ show: false, data: null });
      toast.success(
        `${
          transaction.type === "expense"
            ? transaction.category
            : transaction.source
        } deleted successfully!`,
      );
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete transaction.");
    }
  };

  //download all transactions
  const downloadAllTransactions = () => {
    if (!transactions.length) {
      toast.error("No transactions available for download.");
      return;
    }

    const header = [
      "Type",
      "Title",
      "Amount",
      "Category/Source",
      "Date",
      "Icon URL",
    ];

    const rows = transactions.map((item) => [
      item.type,
      item.type === "expense" ? item.category : item.source,
      item.amount,
      item.type === "expense" ? item.category : item.source,
      item.date,
      item.icon || "",
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dashboardlayout activeMenu="Transactions">
      <div className="space-y-6 my-5 mx-auto">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-1 gap-6">
          <TransactionList
            transactions={transactions}
            onDelete={(transactions) => {
              setOpenDeleteAlert({ show: true, data: transactions });
            }}
            onDownload={downloadAllTransactions}
          />
        </div>

        {loading && (
          <p className="text-sm text-gray-600">Loading transactions...</p>
        )}

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Transaction"
        >
          <DeleteAlert
            content={`${
              openDeleteAlert.data?.type === "expense"
                ? openDeleteAlert.data?.category
                : openDeleteAlert.data?.source || "This"
            } transaction will be deleted from your records.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              deleteTransaction(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Transactions;

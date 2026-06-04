import { useCallback, useEffect, useState } from "react";
import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import { toast } from "react-hot-toast";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";

const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  // get all Income Details
  const fetchIncomeDetails = useCallback(async () => {
    if (loading) return
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      setIncomeData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load income details.");
    } finally {
      setLoading(false);
    }
  }, []);

  // handle Add Income
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    // validation checks
    if (!source.trim()) {
      toast.error("Please enter an income source.");
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

    setSubmitting(true);
    setError("");

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });

      setOpenAddIncomeModal(false);
      toast.success("Income Added Successfully");
      await fetchIncomeDetails();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add income.");
    } finally {
      setSubmitting(false); // Now this works perfectly
    }
  };

  // delete Income
  const deleteIncome = async (income) => {
    if (!income?._id) return;
    setError("");

    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(income._id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success(
        `${openDeleteAlert.data?.source || "Income"} record deleted successfully!`,
      );

      await fetchIncomeDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete income entry.");
    }
  };

  // handle download income details
  const handleDownloadIncomeDetails = async () => {
    setDownloading(true);
    setError("");

    try {
      const response = await axiosInstance.get(
        API_PATHS.INCOME.DOWNLOAD_INCOME,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to download income details. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchIncomeDetails();

    return () => {};
  }, []);
  return (
    <Dashboardlayout activeMenu="Income">
      <div className="space-y-6 my-5 mx-auto">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(income) => {
              setOpenDeleteAlert({ show: true, data: income });
            }}
            onDownload={handleDownloadIncomeDetails}
          />
        </div>

        <Modal
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete income"
        >
          <DeleteAlert
            content={` ${openDeleteAlert.data?.source || "This"} entry will be deleted from your income records.`}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
            onDelete={() => {
              deleteIncome(openDeleteAlert.data);
            }}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default Income;

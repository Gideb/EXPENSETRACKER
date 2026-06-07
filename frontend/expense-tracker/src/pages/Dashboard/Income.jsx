import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // get all Income Details

  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);

      if (response.data) {
        setIncomeData(response.data);
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
    }
  };

  //handle edit income
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setOpenAddIncomeModal(true);
  };

  //handle Update income
 /*  const handleUpdateIncome = async (income) => {
    try {
      await axiosInstance.put(
        API_PATHS.INCOME.UPDATE_INCOME(editingIncome._id),
        income,
      );

     toast.success("Income updated successfully");

     setEditingIncome(null);
     setOpenAddIncomeModal(false);

     await fetchIncomeDetails();
   } catch (error) {
     toast.error(error.response?.data?.message || "Failed to update income");
   }
 }; */

const handleUpdateIncome = async (income) => {
  try {
    console.log("Editing Income:", editingIncome);
    console.log("Payload:", income);

    const response = await axiosInstance.put(
      API_PATHS.INCOME.UPDATE_INCOME(editingIncome._id),
      income,
    );

    console.log("Success:", response.data);

    toast.success("Income updated successfully");

    setEditingIncome(null);
    setOpenAddIncomeModal(false);

    await fetchIncomeDetails();
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    console.error("RESPONSE:", error.response);
    console.error("DATA:", error.response?.data);

    toast.error(error.response?.data?.message || "Failed to update income");
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
      toast.error("Failed to download expense data. Please try again");
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
            handleEditIncome={handleEditIncome}
            onDelete={(income) => {
              setOpenDeleteAlert({ show: true, data: income });
            }}
            onDownload={handleDownloadIncomeDetails}
          />
        </div>

        <Modal
          isOpen={openAddIncomeModal}
          onClose={() => {
            setOpenAddIncomeModal(false);
            setEditingIncome(null);
          }}
          title={editingIncome ? "Edit Income" : "Add Income"}
        >
          <AddIncomeForm
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            editData={editingIncome}
          />
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

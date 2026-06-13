// components/Dashboard/BudgetWidget.jsx
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import banner from "../../assets/images/banner.jpg"

const BudgetWidget = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.fullName?.split(" ")?.[0];

  useEffect(() => {
    fetchBudgetSummary();
  }, []);

  const fetchBudgetSummary = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUDGET.GET_BUDGET_SUMMARY,
      );
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to load budget summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!summary || summary.totalBudget === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Top Banner */}
           <div className="mb-4 overflow-hidden rounded-lg">
        <img
          src={banner}
          alt="Budget Planning"
          className="w-full h-50 object-cover"
        /> 
        </div> 
       {/*  <div className="mb-6 py-20 rounded-lg bg-linear-to-r from-amber-500 via-cream-500 to-yellow-500 p-5">
          <p className="text-white text-xs uppercase tracking-wide">
            Budget Dashboard
          </p>
          <h3 className="text-white font-semibold text-lg">
            Manage your finances smarter
          </h3>
        </div>  */}
        <p className="text-sm my-6 text-gray-500 dark:text-gray-400">
          👋 Welcome {firstName || ""}!{" "}
          <button
            onClick={() => navigate("/budget")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Create your first budget
          </button>{" "}
          to get started.
        </p>
      </div>
    );
  }

  const percent = Math.min(summary.percentUtilized, 100);
  const getStatusColor = () => {
    if (percent >= 90) return "from-red-500 to-red-600";
    if (percent >= 70) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Top Banner */}
        <div className="mb-4 overflow-hidden rounded-lg">
        <img
          src={banner}
          alt="Budget Planning"
          className="w-full h-28 object-cover"
        /> 
        </div>
      {/* <div className="mb-3 rounded-lg bg-linear-to-r from-amber-500 via-cream-500 to-yellow-500 p-5">
        <p className="text-white text-xs uppercase tracking-wide">
          Budget Dashboard
        </p>
        <h3 className="text-white font-semibold text-lg">
          Manage your finances smarter
        </h3>
      </div> */}

      {/* Header with greeting */}
      <div className="flex items-center justify-between mb-3 ">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Hello, {firstName || "there"}! 👋
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Your budget at a glance
          </p>
        </div>
        {summary.overBudgetCategories > 0 && (
          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400">
            {summary.overBudgetCategories} alert
            {summary.overBudgetCategories !== 1 && "s"}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2 ">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Monthly progress
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percent)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-linear-to-r ${getStatusColor()} rounded-full transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 ">
        <div>
          <p className="text-gray-500">Budget</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ₵{Math.round(summary.totalBudget)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Spent</p>
          <p className="font-semibold text-orange-600 dark:text-orange-400">
            ₵{Math.round(summary.totalSpent)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Remaining</p>
          <p
            className={`font-semibold ${summary.remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            ₵{Math.round(Math.abs(summary.remainingBalance))}
          </p>
        </div>
      </div>

      {/* Quick link */}
      <button
        onClick={() => navigate("/budget")}
        className="block text-center text-xs text-blue-500 hover:text-blue-600 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 "
      >
        View all budgets →
      </button>
    </div>
  );
};

export default BudgetWidget;

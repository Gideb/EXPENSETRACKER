import { useEffect, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdMoneyOff,
  MdSavings,
  MdWarning,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from "react-hot-toast";

const BudgetSummary = ({ setOpenAddBudgetModal }) => {
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    overBudgetCategories: 0,
    percentUtilized: 0,
    categoriesAtRisk: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetSummary();
  }, []);

  const fetchBudgetSummary = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.BUDGET.GET_BUDGET_SUMMARY,
      );

      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Failed to load budget summary:", error);
      toast.error("Failed to load budget summary");

      // Fallback demo data
      /* setSummary({
        totalBudget: 2000,
        totalSpent: 1500,
        remainingBalance: 500,
        overBudgetCategories: 1,
        percentUtilized: 75,
        categoriesAtRisk: 2,
      }); */
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const summaryCards = [
    {
      title: "Total Budget",
      value: formatCurrency(summary.totalBudget),
      icon: <MdAccountBalanceWallet className="text-2xl sm:text-3xl" />,
      
      textColor: "text-slate-800 dark:text-gray-100",
      subtitle: "Allocated for this month",
    },
    {
      title: "Total Spent",
      value: formatCurrency(summary.totalSpent),
      icon: <MdMoneyOff className="text-2xl sm:text-3xl" />,
     
      textColor: "text-slate-800 dark:text-gray-100",
      subtitle: `${summary.percentUtilized}% of budget used`,
    },
    {
      title: "Remaining Balance",
      value: formatCurrency(summary.remainingBalance),
      icon: <MdSavings className="text-2xl sm:text-3xl" />,
      
      textColor: "text-slate-800 dark:text-gray-100",
      subtitle: summary.remainingBalance < 0 ? "Over budget!" : "Left to spend",
      warning: summary.remainingBalance < 0,
    },
    {
      title: "Over Budget Categories",
      value: summary.overBudgetCategories,
      icon: <MdWarning className="text-2xl sm:text-3xl" />,
     
      textColor: "text-slate-800 dark:text-gray-100",
      subtitle: `${summary.categoriesAtRisk} categories near limit`,
      warning: summary.overBudgetCategories > 0,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
          >
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Budget Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your monthly budget performance
          </p>
        </div>

        {/* Overall Progress Ring */}
        <div className="hidden md:block">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FaChartLine className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Overall Progress:
              <span className="ml-1 font-semibold text-blue-600 dark:text-blue-400">
                {summary.percentUtilized}%
              </span>
            </span>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary.percentUtilized, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-100 dark:border-gray-700"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`${card.textColor} opacity-90 group-hover:scale-110 transition-transform duration-300`}
                >
                  {card.icon}
                </div>
                {card.warning && (
                  <span className="px-2 py-1 text-xs font-bold bg-red-600 bg-opacity-30 text-white rounded animate-pulse">
                    Alert!
                  </span>
                )}
              </div>

              <h3
                className={`${card.textColor} text-sm font-medium opacity-90 mb-1`}
              >
                {card.title}
              </h3>

              <p
                className={`${card.textColor} text-xl sm:text-2xl lg:text-3xl font-semibold mb-2`}
              >
                {card.value}
              </p>

              <p
                className={`${card.textColor} text-xs opacity-80 flex items-center gap-1`}
              >
                <span className="inline-block w-1 h-1 rounded-full bg-white opacity-60"></span>
                {card.subtitle}
              </p>
            </div>

            {/* Decorative progress bar for Total Budget card */}
            {card.title === "Total Budget" && (
              <div className="h-1 bg-white bg-opacity-20 w-full">
                <div
                  className="h-full bg-white bg-opacity-40 transition-all duration-500"
                  style={{
                    width: `${Math.min(summary.percentUtilized, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => setOpenAddBudgetModal(true)}
            className="add-btn transition-colors"
          >
            + Add Budget
          </button>
          <button
            onClick={() => (window.location.href = "/expense")}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded border border-gray-400 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Record Expense
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;

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
      icon: <MdAccountBalanceWallet className="text-xl sm:text-2xl" />,
      subtitle: "Allocated for this month",
    },
    {
      title: "Total Spent",
      value: formatCurrency(summary.totalSpent),
      icon: <MdMoneyOff className="text-xl sm:text-2xl" />,
      subtitle: `${summary.percentUtilized}% of budget used`,
      progress: summary.percentUtilized,
    },
    {
      title: "Remaining Balance",
      value: formatCurrency(Math.abs(summary.remainingBalance)),
      icon: <MdSavings className="text-xl sm:text-2xl" />,
      subtitle:
        summary.remainingBalance < 0 ? "Over budget by" : "Left to spend",
      negative: summary.remainingBalance < 0,
    },
    {
      title: "Over Budget Categories",
      value: summary.overBudgetCategories,
      icon: <MdWarning className="text-xl sm:text-2xl" />,
      subtitle: `${summary.categoriesAtRisk} categories near limit`,
      warning: summary.overBudgetCategories > 0,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            key={i}
            className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 animate-pulse border border-gray-100 dark:border-gray-700"
          >
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Budget Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your monthly budget performance
          </p>
        </div>

        {/* Overall Progress Indicator */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-800/50">
          <FaChartLine className="text-amber-600 dark:text-amber-400 text-sm" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Overall Progress:
            <span className="ml-1 font-semibold text-amber-700 dark:text-amber-400">
              {summary.percentUtilized}%
            </span>
          </span>
          <div className="w-24 h-1.5 bg-amber-200 dark:bg-amber-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 dark:bg-amber-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(summary.percentUtilized, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sm:justify-end justify-start">
        <button
          onClick={() => setOpenAddBudgetModal(true)}
          className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl transition-all duration-200 shadow-sm add-btn-fill add-btn"
        >
          + Add Budget
        </button>
        <button
          onClick={() => (window.location.href = "/expense")}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 transition-all duration-200 cursor-pointer"
        >
          Record Expense
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, index) => {
          const isNegative = card.negative;
          const isWarning = card.warning;

          return (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-900/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800/50"
            >
              <div className="relative p-5">
                {/* Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                    {card.icon}
                  </div>
                  {(isNegative || isWarning) && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800/50 animate-pulse">
                      Alert
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {card.title}
                  </h3>

                  <p
                    className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                      isNegative || isWarning
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {isNegative && "- "}
                    {card.value}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    {card.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Total Spent card */}
              {card.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(card.progress, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;

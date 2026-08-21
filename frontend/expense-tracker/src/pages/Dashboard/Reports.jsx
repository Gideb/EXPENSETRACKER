import { useState } from 'react';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import Input from '../../components/Inputs/Input';

const Reports = () => {
  useUserAuth();

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

const handleQuickSelect = (period) => {
  const today = new Date();

  let start;
  let end = new Date(today);

  if (period === '7days') {
    start = new Date(today);
    start.setDate(today.getDate() - 6);
  }

  if (period === 'month') {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    end = new Date(today.getFullYear(), today.getMonth(), 0);
  }

  if (period === '3months') {
    start = new Date(today.getFullYear(), today.getMonth() - 3, 1);

    end = new Date(today.getFullYear(), today.getMonth(), 0);
  }

  setDateRange({
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  });
};

  const handleGeneratePDF = async () => {
    if (!isDateRangeValid) return;

    try {
      setIsGeneratingPDF(true);

      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_PDF, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-statement-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate financial statement.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isDateRangeValid =
    dateRange.startDate && dateRange.endDate && dateRange.startDate <= dateRange.endDate;

  return (
    <Dashboardlayout activeMenu="Reports">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Financial Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate a complete statement of your financial activity.
          </p>
        </div>

        {/* Main Report Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Generate Financial Statement
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a period to generate a complete financial statement containing your
              transactions, budgets, and savings goals.
            </p>
          </div>

          <div className="p-6">
            {/* Report Period */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Report Period
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />

                <Input
                  label="End Date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Invalid date message */}
              {dateRange.startDate &&
                dateRange.endDate &&
                dateRange.startDate > dateRange.endDate && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    End date cannot be earlier than the start date.
                  </p>
                )}
            </div>

            {/* Quick Selection */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Quick Selection
              </h3>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('7days')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Last 7 Days
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect('month')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Last Month
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect('3months')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Last 3 Months
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Or enter your own dates above for a custom report period.
              </p>
            </div>

            {/* What's Included */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Your statement will include
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>

                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Income & Expenses
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>

                  <span className="text-sm text-slate-700 dark:text-slate-200">Budgets</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>

                  <span className="text-sm text-slate-700 dark:text-slate-200">Savings Goals</span>
                </div>
              </div>
            </div>

            {/* Generate */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={!isDateRangeValid || isGeneratingPDF}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {isGeneratingPDF ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating Statement...
                  </span>
                ) : (
                  'Generate Statement'
                )}
              </button>

              {!dateRange.startDate || !dateRange.endDate ? (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Select a report period to continue.
                </p>
              ) : !isDateRangeValid ? (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Please select a valid date range.
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Your statement will be generated as a PDF.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Small Information Note */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Your financial statement provides a single view of your financial activity for the
            selected period, including your transactions, budget performance, and savings goals.
          </p>
        </div>
      </div>
    </Dashboardlayout>
  );
};

export default Reports;

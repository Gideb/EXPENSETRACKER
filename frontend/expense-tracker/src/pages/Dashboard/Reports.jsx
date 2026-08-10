import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import Input from '../../components/Inputs/Input';

const Reports = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  const handleGeneratePDF = () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      // In a real app, you'd trigger the actual PDF download here
      alert('PDF generated successfully!');
    }, 1500);
  };

  return (
    <Dashboardlayout activeMenu="Reports">
      <div className="max-w-7xl space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="my-3">
          <h3 className="text-slate-900 dark:text-slate-200 text-2xl font-medium">Reports</h3>
          <p className="text-xs text-slate-500">Generate a complete financial statement.</p>
          <p className="text-xs text-slate-500">
            View your transactions, budgets and goals in one statement.
          </p>
        </div>

        {/* Date Range Selection */}
        <div className="mt-6">
          <h3 className="text-slate-900 dark:text-slate-200 text-xl font-medium mb-3">
            Report Period
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, startDate: e.target.value });
              }}
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, endDate: e.target.value });
              }}
            />
          </div>
        </div>

        {/* Quick Selection */}
        <div>
          <h3 className="text-slate-900 dark:text-slate-200 text-xl font-medium mb-3">
            Quick Selection
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickSelect(7)}
              className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickSelect(30)}
              className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => handleQuickSelect(90)}
              className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Last 3 Months
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={handleGeneratePDF}
            disabled={!dateRange.startDate || !dateRange.endDate || isGeneratingPDF}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isGeneratingPDF ? (
              <span className="flex items-center gap-2">
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
                Generating...
              </span>
            ) : (
              'Generate PDF'
            )}
          </button>
          {(!dateRange.startDate || !dateRange.endDate) && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Please select both start and end dates
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">Data synced</p>
        </div>
      </div>
    </Dashboardlayout>
  );
};

export default Reports;

import { Download, FileText, Printer, Clock } from 'lucide-react';

const ReportsHeader = ({
  isGeneratingPDF,
  onExportPDF,
  onExportCSV,
  onPrint,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-500 text-xs dark:text-gray-400 mt-1">
          Analyze your financial data and track your spending habits
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onExportPDF}
          disabled={isGeneratingPDF}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              PDF Report
            </>
          )}
        </button>

        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>

        <button
          onClick={onPrint}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </div>
  );
};

export default ReportsHeader;


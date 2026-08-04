import { Download, FileText, Printer, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa6';

const ReportsHeader = ({ isGeneratingPDF, onExportPDF, onExportCSV, onPrint }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex justify-between items-center gap-4 mx-1">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Reports</h1>
          <p className="hidden sm:block text-gray-500 text-xs dark:text-gray-400 mt-1">
            Analyze your financial data and track your spending habits
          </p>
          <p className="sm:hidden text-gray-500 text-xs dark:text-gray-400 mt-1">
            Financial Reports & Analytics
          </p>
        </div>

        <div ref={dropdownRef} className="relative sm:hidden">
          {/* Dropdown Trigger */}
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 rounded bg-amber-50 dark:bg-amber-100 text-amber-800 dark:text-amber-900 shadow-sm"
          >
            Export
            {openDropdown ? <FaCaretUp className="text-sm" /> : <FaCaretDown className="text-sm" />}
          </button>

          {/* Dropdown Menu */}
          {openDropdown && (
            <div className="absolute right-0 mt-1 w-25  rounded bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => {
                  onExportPDF();
                  setOpenDropdown(false);
                }}
                disabled={isGeneratingPDF}
                className="w-full flex items-center text-xs gap-3 px-2 py-2 text-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <Clock className="w-3 h-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    PDF
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onExportCSV();
                  setOpenDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-2 py-2 text-center hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>

              <button
                onClick={() => {
                  onPrint();
                  setOpenDropdown(false);
                }}
                className="w-full flex items-center gap-3 text-xs px-2 py-1 text-center hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Printer className="w-3 h-3" />
                Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="hidden sm:flex flex-wrap gap-2">
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

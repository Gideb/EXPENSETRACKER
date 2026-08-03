import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

import ReportsHeader from '../../components/Reports/ReportsHeader';
import ReportsTabs from '../../components/Reports/ReportsTabs';
import ReportsFilterBar from '../../components/Reports/ReportsFilterBar';
import ReportsLoading from '../../components/Reports/ReportsLoading';
import SummaryReport from '../../components/Reports/SummaryReport';
import MonthlyReport from '../../components/Reports/MonthlyReport';
import BudgetReport from '../../components/Reports/BudgetReport';
import AnalyticsReport from '../../components/Reports/AnalyticsReport';

const Reports = () => {
  useUserAuth();

  const [activeTab, setActiveTab] = useState('summary');
  const [selectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const [isGeneratingPDF] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [financialData, setFinancialData] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.REPORTS.CATEGORIES);

        setCategories(response.data?.all || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `${API_PATHS.REPORTS.FULL}?year=${selectedYear}&month=${selectedMonth}`
        );

        setFinancialData(response.data);
      } catch (error) {
        toast.error('Failed to load reports.');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [selectedYear, selectedMonth]);

  //years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_PDF, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'financial-report.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_CSV, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'financial-report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getTransactionDateValue = (item) => {
    const date = new Date(item?.date);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  // Compute filtered transactions
  const getFilteredTransactions = () => {
    const transactionsData = financialData?.transactions || {};
    const incomes = Array.isArray(transactionsData.incomes) ? transactionsData.incomes : [];
    const expenses = Array.isArray(transactionsData.expenses) ? transactionsData.expenses : [];

    const transactions = [
      ...incomes.map((item) => ({ ...item, type: 'income' })),
      ...expenses.map((item) => ({ ...item, type: 'expense' })),
    ];

    return transactions
      .filter((t) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const catMatch =
            t.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            t.source?.toLowerCase() === selectedCategory.toLowerCase();
          if (!catMatch) return false;
        }

        // Transaction type filter
        if (transactionType !== 'all' && t.type !== transactionType) {
          return false;
        }

        // Min amount filter
        if (minAmount && t.amount < Number(minAmount)) {
          return false;
        }
        // Max amount filter
        if (maxAmount && t.amount > Number(maxAmount)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => getTransactionDateValue(b) - getTransactionDateValue(a));
  };

  if (loading) {
    return (
      <Dashboardlayout activeMenu="Reports">
        <ReportsLoading />
      </Dashboardlayout>
    );
  }

  return (
    <Dashboardlayout activeMenu="Reports">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <ReportsHeader
          isGeneratingPDF={isGeneratingPDF}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
        />

        {/* Tabs */}
        <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Filter Bar */}
        <ReportsFilterBar
          years={years}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          activeTab={activeTab}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showFilterOptions={showFilterOptions}
          onToggleFilters={() => setShowFilterOptions((prev) => !prev)}
          minAmount={minAmount}
          onMinAmountChange={setMinAmount}
          maxAmount={maxAmount}
          onMaxAmountChange={setMaxAmount}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
        />

        {/* Tab Content */}
        <div className="min-h-100">
          {activeTab === 'summary' && (
            <SummaryReport
              financialData={financialData}
              selectedMonth={selectedMonth}
              transactions={getFilteredTransactions()}
              onSeeMore={() => navigate('/transactions')}
            />
          )}
          {activeTab === 'monthly' && (
            <MonthlyReport monthlyData={financialData?.monthlyData || []} />
          )}
          {activeTab === 'budget' && <BudgetReport budgetData={financialData?.budgetData || []} />}
          {activeTab === 'analytics' && <AnalyticsReport financialData={financialData} />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">Data synced </p>
        </div>
      </div>
    </Dashboardlayout>
  );
};

export default Reports;

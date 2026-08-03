import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import MonthlyBarChart from '../../components/Charts/MonthlyBarChart';
import { addThousandsSeparator, getAvailableMonths, getAvailablePeriods } from '../../utils/helper';
import { toast } from 'react-hot-toast';

import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  Printer,
  Mail,
  Filter,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Wallet,
  CreditCard,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';

const Reports = () => {
  useUserAuth();

  const [activeTab, setActiveTab] = useState('summary');
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, '0')
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Filter state
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [categories, setCategories] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);

  useEffect(() => {
    const fetchPeriods = async () => {
      const res = await axiosInstance.get(API_PATHS.REPORTS.AVAILABLE_PERIODS);

      setAvailablePeriods(res.data);
    };

    fetchPeriods();
  }, []);

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
        const [financial, monthly, category, budgetPerf] = await Promise.all([
          axiosInstance.get(`${API_PATHS.REPORTS.FINANCIAL}?year=${selectedYear}`),
          axiosInstance.get(`${API_PATHS.REPORTS.MONTHLY}?year=${selectedYear}`),
          axiosInstance.get(`${API_PATHS.REPORTS.CATEGORY_ANALYSIS}?year=${selectedYear}`),
          axiosInstance.get(
            `${API_PATHS.REPORTS.BUDGET_PERFORMANCE}?year=${selectedYear}&month=${selectedMonth}`
          ),
        ]);

       
        const budgetData = (budgetPerf.data?.performance || []).map((b) => ({
          id: b.id,
          icon: b.icon,
          category: b.category,
          month: b.month,
          year: b.year,
          budget: b.budgetLimit,
          spent: b.spent,
          remaining: b.remaining,
          percentage: b.percentage,
          status: b.status,
        }));

setFinancialData({
          ...financial.data,
          monthlyData: monthly.data,
          categorySpending: category.data?.expenses?.categories || [],
          budgetData,
        });
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

  // Category icon mapping
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Food: Utensils,
      Housing: Home,
      Transport: Car,
      Shopping: ShoppingBag,
      Entertainment: Smartphone,
      Healthcare: Heart,
      Utilities: CreditCard,
      Insurance: Briefcase,
      Rent: Home,
      Salary: DollarSign,
      Freelance: Briefcase,
    };
    return iconMap[categoryName] || Wallet;
  };

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

  //controller needs to be added
  const handleEmailReport = async () => {
    try {
      setIsSendingEmail(true);
      await axiosInstance.post(API_PATHS.REPORTS.EMAIL_REPORT);
      toast.success('Report sent to your email successfully!');
      alert('Report sent to your email successfully!');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to send email report.');
    } finally {
      setIsSendingEmail(false);
    }
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

    return transactions.filter((t) => {
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
    });
  };

  // Helper function to render category icon
  const renderCategoryIcon = (categoryName, className = 'w-5 h-5') => {
    const IconComponent = getCategoryIcon(categoryName);
    return <IconComponent className={className} />;
  };

  // Tab content components

  //SUMMARY
  const renderSummary = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {`GHS ${addThousandsSeparator(financialData?.summary?.totalIncome)}`}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>12.5% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {`GHS ${addThousandsSeparator(financialData?.summary?.totalExpenses)}`}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-4 h-4" />
            <span>8.2% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {`GHS ${addThousandsSeparator(financialData?.summary?.balance)}`}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {`${financialData?.summary?.savingsRate}%`}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${financialData?.summary?.savingsRate || 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <RecentTransactions
          transactions={getFilteredTransactions()}
          onSeeMore={() => navigate('/transactions')}
        />
      </div>
    </div>
  );

  //MONTHLY REPORT
  const renderMonthlyReports = () => {
    return (
      <div className="space-y-6">
        {/* Month Selector */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
             
               <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select> 
            </div>
            
          </div>

        
        </div> */}

        {/* Monthly Chart - Bar Chart Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h3>
          <MonthlyBarChart data={financialData?.monthlyData || []} />
        </div>

        {/* Monthly Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Savings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {financialData?.monthlyData?.map((data, index) => {
                  const savings = data.income - data.expenses;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {data.month}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">
                        GHS {addThousandsSeparator(data.income)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
                        GHS {addThousandsSeparator(data.expenses)}
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-600 dark:text-amber-400">
                        GHS {addThousandsSeparator(savings)}
                      </td>
                      <td className="px-6 py-4">
                        {savings > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Positive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Deficit
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  //BUDGET
  const renderBudgetReports = () => (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS{' '}
                {addThousandsSeparator(
                  financialData?.budgetData?.reduce((sum, b) => sum + b.budget, 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                GHS{' '}
                {addThousandsSeparator(
                  financialData?.budgetData?.reduce((sum, b) => sum + b.spent, 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                GHS{' '}
                {addThousandsSeparator(
                  financialData?.budgetData?.reduce((sum, b) => sum + b.remaining, 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {financialData?.budgetData?.map((budget, index) => {
        const percentage = (budget.spent / budget.budget) * 100;
        const isOverBudget = percentage > 100;
        const isNearLimit = percentage > 80 && percentage <= 100;
        const IconComponent = getCategoryIcon(budget.category);

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{budget.category}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GHS {addThousandsSeparator(budget.spent)} of GHS{' '}
                    {addThousandsSeparator(budget.budget)} spent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-semibold ${
                    isOverBudget
                      ? 'text-red-600 dark:text-red-400'
                      : isNearLimit
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {isOverBudget ? 'Over Budget' : `${Math.round(percentage)}%`}
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-red-600 dark:bg-red-400'
                    : isNearLimit
                      ? 'bg-yellow-500 dark:bg-yellow-400'
                      : 'bg-green-600 dark:bg-green-400'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>GHS {addThousandsSeparator(budget.remaining)} remaining</span>
              <span>{budget.category}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  //ANALYTICS
  const generateInsights = () => {
    const insights = [];
    const summary = financialData?.summary;
    const categories = financialData?.categorySpending || [];
    const budgets = financialData?.budgetData || [];

    // Income insight
    if (summary?.totalIncome > 0) {
      insights.push({
        type: 'income',
        title: 'Income Overview',
        message: `You have earned GHS ${summary.totalIncome.toLocaleString()} in total income.`,
        icon: TrendingUp,
        color: 'amber',
      });
    }

    // Highest spending category
    if (categories.length > 0) {
      const highestCategory = [...categories].sort((a, b) => b.amount - a.amount)[0];

      insights.push({
        type: 'expense',
        title: 'Top Spending Category',
        message: `${highestCategory.category} is your highest spending category at GHS ${highestCategory.amount.toLocaleString()}.`,
        icon: AlertCircle,
        color: 'yellow',
      });
    }

    // Budget warning
    const exceededBudget = budgets.find((budget) => budget.spent > budget.budget);

    const nearLimitBudget = budgets.find((budget) => budget.spent / budget.budget >= 0.8);

    if (exceededBudget) {
      insights.push({
        type: 'budget',
        title: 'Budget Alert',
        message: `${exceededBudget.category} has exceeded your budget.`,
        icon: AlertCircle,
        color: 'red',
      });
    } else if (nearLimitBudget) {
      insights.push({
        type: 'budget',
        title: 'Budget Warning',
        message: `${nearLimitBudget.category} is close to its budget limit.`,
        icon: AlertCircle,
        color: 'yellow',
      });
    }

    // Savings insight
    if (summary?.savingsRate >= 20) {
      insights.push({
        type: 'saving',
        title: 'Savings Goal',
        message: `Great work! You are saving ${summary.savingsRate}% of your income.`,
        icon: CheckCircle,
        color: 'green',
      });
    } else if (summary) {
      insights.push({
        type: 'saving',
        title: 'Savings Improvement',
        message: `Your current savings rate is ${summary.savingsRate}%. Try increasing it gradually.`,
        icon: TrendingDown,
        color: 'yellow',
      });
    }

    return insights.slice(0, 3);
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {financialData?.categorySpending?.map((category, index) => {
            const IconComponent = getCategoryIcon(category.category);

            return (
              <div key={`${category.category}-${index}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>

                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      GHS {category.amount}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                      {category.percentage || 0}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-amber-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${category.percentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Top Spending Categories
          </h4>
          <div className="space-y-3">
            {[...(financialData?.categorySpending || [])]
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}.
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    GHS {addThousandsSeparator(category.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Insights</h4>

          <div className="space-y-4">
            {generateInsights().map((insight, index) => {
              const Icon = insight.icon;
              const styles = {
                amber: {
                  box: 'bg-amber-50 dark:bg-amber-900/20',
                  icon: 'bg-amber-100 dark:bg-amber-800',
                  text: 'text-amber-900 dark:text-amber-300',
                  desc: 'text-amber-700 dark:text-amber-400',
                },
                yellow: {
                  box: 'bg-yellow-50 dark:bg-yellow-900/20',
                  icon: 'bg-yellow-100 dark:bg-yellow-800',
                  text: 'text-yellow-900 dark:text-yellow-300',
                  desc: 'text-yellow-700 dark:text-yellow-400',
                },
                green: {
                  box: 'bg-green-50 dark:bg-green-900/20',
                  icon: 'bg-green-100 dark:bg-green-800',
                  text: 'text-green-900 dark:text-green-300',
                  desc: 'text-green-700 dark:text-green-400',
                },
                red: {
                  box: 'bg-red-50 dark:bg-red-900/20',
                  icon: 'bg-red-100 dark:bg-red-800',
                  text: 'text-red-900 dark:text-red-300',
                  desc: 'text-red-700 dark:text-red-400',
                },
              };

              const style = styles[insight.color];

              return (
                <div key={index} className={`p-4 ${style.box} rounded-xl`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 ${style.icon} rounded-lg`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${style.text}`}>{insight.title}</p>

                      <p className={`text-sm ${style.desc}`}>{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Dashboardlayout activeMenu="Reports">
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </Dashboardlayout>
    );
  }

  return (
    <Dashboardlayout activeMenu="Reports">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analyze your financial data and track your spending habits
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPDF}
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
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleEmailReport}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap gap-2 -mb-px">
              {[
                { id: 'summary', label: 'Financial Summary', icon: BarChart3 },
                { id: 'monthly', label: 'Monthly Reports', icon: Calendar },
                { id: 'budget', label: 'Budget Reports', icon: Wallet },
                { id: 'analytics', label: 'Analytics', icon: PieChart },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Filters:</span>
            </div>

            {/*  year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {activeTab === 'summary' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              More Filters
              {showFilterOptions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {showFilterOptions && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-100">
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'monthly' && renderMonthlyReports()}
          {activeTab === 'budget' && renderBudgetReports()}
          {activeTab === 'analytics' && renderAnalytics()}
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

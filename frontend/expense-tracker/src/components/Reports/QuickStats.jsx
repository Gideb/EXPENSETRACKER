import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { GoArrowDownLeft, GoArrowUpRight } from 'react-icons/go';
import { addThousandsSeparator } from '../../utils/helper';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const QuickStats = ({ summary, monthlyData, selectedMonth }) => {
  // Compute percentage change from previous month for income/expense
  const getMonthChange = (type) => {
    const monthly = Array.isArray(monthlyData) ? monthlyData : [];
    const monthIndex = Number(selectedMonth) - 1;
    const prevMonthIndex = monthIndex - 1;

    const current = monthly.find((m) => m.month === MONTH_NAMES[monthIndex]);
    const prev = monthly.find((m) => m.month === MONTH_NAMES[prevMonthIndex]);

    const currentVal = current ? (type === 'income' ? current.income : current.expenses) : 0;
    const prevVal = prev ? (type === 'income' ? prev.income : prev.expenses) : 0;

    if (!prevVal || prevVal <= 0) return null;

    return ((currentVal - prevVal) / prevVal) * 100;
  };

  const renderMonthChange = (type) => {
    const change = getMonthChange(type);

    if (change === null) return <span>from last month</span>;

    const isUp = change >= 0;
    const isPositiveMetric = type === 'income';
    // For income, increase is good (green); for expenses, increase is bad (red)
    const good = isPositiveMetric ? isUp : !isUp;

    return (
      <span
        className={`flex items-center gap-1 dark:text-gray-500 ${
          good ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isUp ? <GoArrowUpRight /> : <GoArrowDownLeft />}
        {change.toFixed(1)}% from last month
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {`GHS ${addThousandsSeparator(summary?.totalIncome) || 0}`}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">{renderMonthChange('income')}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {`GHS ${addThousandsSeparator(summary?.totalExpense) || 0}`}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">{renderMonthChange('expense')}</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {`GHS ${addThousandsSeparator(summary?.balance) || 0}`}
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
              {`${summary?.savingsRate || 0} %`}
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
              width: `${summary?.savingsRate || 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickStats;


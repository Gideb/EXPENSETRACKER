import { TrendingUp, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { addThousandsSeparator } from '../../utils/helper';
import { getCategoryIcon } from './categoryIcons';

const generateInsights = (summary, categorySpending, budgetData) => {
  const insights = [];
  const categories = categorySpending || [];
  const budgets = budgetData || [];

  // Income insight
  if (summary?.totalIncome > 0) {
    insights.push({
      type: 'income',
      title: 'Income Overview',
      message: `You have earned GH₵ ${summary.totalIncome.toLocaleString()} in total income.`,
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
      message: `${highestCategory.category} is your highest spending category at GH₵ ${highestCategory.amount.toLocaleString()}.`,
      icon: AlertCircle,
      color: 'yellow',
    });
  }

  // Budget warning
  const exceededBudget = budgets.find((budget) => budget.spent > budget.budget);

  const nearLimitBudget = budgets.find((budget) => budget.budget > 0 && budget.spent / budget.budget >= 0.8);

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

const INSIGHT_STYLES = {
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

const AnalyticsReport = ({ financialData }) => {
  const categorySpending = financialData?.categorySpending || [];
  const insights = generateInsights(
    financialData?.summary,
    categorySpending,
    financialData?.budgetData
  );

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {categorySpending?.map((category, index) => {
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
                      GH₵ {category.amount}
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
            {[...categorySpending]
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
                    GH₵ {addThousandsSeparator(category.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Insights</h4>

          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const style = INSIGHT_STYLES[insight.color];

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
};

export default AnalyticsReport;

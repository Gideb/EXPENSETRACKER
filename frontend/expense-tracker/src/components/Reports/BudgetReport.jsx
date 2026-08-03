import { Wallet, CreditCard, CheckCircle } from 'lucide-react';
import { addThousandsSeparator } from '../../utils/helper';
import { getCategoryIcon } from './categoryIcons';

const BudgetReport = ({ budgetData = [] }) => {
  const totalBudget = budgetData.reduce((sum, b) => sum + (b.budget || 0), 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = budgetData.reduce((sum, b) => sum + (b.remaining || 0), 0);

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS {addThousandsSeparator(totalBudget)}
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
                GHS {addThousandsSeparator(totalSpent)}
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
                GHS {addThousandsSeparator(totalRemaining)}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {budgetData?.map((budget, index) => {
        const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
        const isOverBudget = percentage > 100;
        const isNearLimit = percentage > 80 && percentage <= 100;
        const IconComponent = getCategoryIcon(budget.category);

        return (
          <div
            key={budget.id || index}
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
};

export default BudgetReport;

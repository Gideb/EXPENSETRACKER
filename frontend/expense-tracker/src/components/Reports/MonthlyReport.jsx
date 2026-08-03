import MonthlyBarChart from '../Charts/MonthlyBarChart';
import { addThousandsSeparator } from '../../utils/helper';
import { CheckCircle, AlertCircle } from 'lucide-react';

const MonthlyReport = ({ monthlyData = [] }) => {
  return (
    <div className="space-y-6">
      {/* Monthly Chart - Bar Chart Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h3>
        <div className="h-72 sm:h-80 w-full overflow-hidden">
          <MonthlyBarChart data={monthlyData} />
        </div>
      </div>

      {/* Monthly Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
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
              {monthlyData?.map((data, index) => {
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

        <div className="space-y-3 p-4 md:hidden">
          {monthlyData?.map((data, index) => {
            const savings = data.income - data.expenses;
            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {data.month}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Income vs expenses for this month
                    </p>
                  </div>
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
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-white/80 dark:bg-gray-800/70 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Income
                    </p>
                    <p className="mt-1 font-medium text-green-600 dark:text-green-400">
                      GHS {addThousandsSeparator(data.income)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-gray-800/70 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Expenses
                    </p>
                    <p className="mt-1 font-medium text-red-600 dark:text-red-400">
                      GHS {addThousandsSeparator(data.expenses)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-white/80 dark:bg-gray-800/70 p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Savings</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      GHS {addThousandsSeparator(savings)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;

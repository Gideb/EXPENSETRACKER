import QuickStats from './QuickStats';
import RecentTransactions from '../Dashboard/RecentTransactions';

const SummaryReport = ({
  financialData,
  selectedMonth,
  transactions,
  onSeeMore,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <QuickStats
        summary={financialData?.summary}
        monthlyData={financialData?.monthlyData}
        selectedMonth={selectedMonth}
      />

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <RecentTransactions transactions={transactions} onSeeMore={onSeeMore} />
      </div>
    </div>
  );
};

export default SummaryReport;


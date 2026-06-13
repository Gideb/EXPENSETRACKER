const BudgetCard = ({ budget }) => {
  const spent = budget.spentAmount || 0;
  const limit = budget.limitAmount || 0;

  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - spent, 0);
  const isExceeded = spent > limit;
  const isNearLimit = percent >= 80 && percent < 100;

  // Determine status color
  const getStatusColor = () => {
    if (isExceeded) return "#ef4444"; // red
    if (isNearLimit) return "#f59e0b"; // amber/warning
    return "#10b981"; // green
  };

  // Get status text
  const getStatusText = () => {
    if (isExceeded) return "Exceeded";
    if (isNearLimit) return "Near Limit";
    return "On Track";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="budget-card group">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {budget.icon && <span className="text-2xl">{budget.icon}</span>}
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {budget.category}
          </h4>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            isExceeded
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : isNearLimit
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Amount Section */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Spent
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Budget
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(spent)}
          </span>
          <span className="text-lg text-gray-600 dark:text-gray-400">
            / {formatCurrency(limit)}
          </span>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Progress</span>
          <span>{Math.round(percent)}%</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: getStatusColor(),
            }}
          />
        </div>
      </div>

      {/* Remaining Section */}
      <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Remaining
          </span>
          <span
            className={`text-lg font-semibold ${
              isExceeded
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {isExceeded && (
        <div className="flex items-center gap-2 px-3 py-2 mt-3 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          <span>⚠️</span>
          <span>Budget exceeded by {formatCurrency(spent - limit)}</span>
        </div>
      )}

      {isNearLimit && !isExceeded && (
        <div className="flex items-center gap-2 px-3 py-2 mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
          <span>⚠️</span>
          <span>You're close to your budget limit!</span>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;

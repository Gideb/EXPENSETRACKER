import { FiEdit2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { LuTrash2, LuWallet, LuChartPie } from "react-icons/lu";

const BudgetCard = ({ budget, icon, onEdit, onDelete }) => {
  const spent = budget.spentAmount || 0;
  const limit = budget.limitAmount || 0;

  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - spent, 0);
  const isExceeded = spent > limit;
  const isNearLimit = percent >= 80 && percent < 100;

  // Get status text
  const getStatusText = () => {
    if (isExceeded) return "Exceeded";
    if (isNearLimit) return "Near Limit";
    return "On Track";
  };

  // Determine status gradient
  const getStatusGradient = () => {
    if (isExceeded) return "from-red-500 to-red-600";
    if (isNearLimit) return "from-amber-500 to-orange-500";
    return "from-emerald-500 to-green-600";
  };

  const getStatusColor = () => {
    if (isExceeded) return "#ef4444";
    if (isNearLimit) return "#f59e0b";
    return "#10b981";
  };

  // Format currency compact
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get usage icon
  const getUsageIcon = () => {
    if (isExceeded)
      return <FiTrendingDown className="text-red-500" size={12} />;
    if (isNearLimit)
      return <FiTrendingUp className="text-amber-500" size={12} />;
    return <FiTrendingUp className="text-emerald-500" size={12} />;
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group m-2">
      {/* Top colored bar indicator */}
      <div className={`h-0.5 bg-linear-to-r ${getStatusGradient()}`} />

      <div className="p-3.5">
        {/* Header - Icon, Category, Actions */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              {icon ? (
                <img src={icon} alt="" className="w-3.5 h-3.5" />
              ) : (
                <LuWallet className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
              {budget.category}
            </h4>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit?.(budget)}
              className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Edit"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={() => onDelete?.(budget._id)}
              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Delete"
            >
              <LuTrash2 size={15} />
            </button>
          </div>
        </div>

        {/* Main Stats - Compact Side by Side */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Spent
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {formatCurrency(spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              of {formatCurrency(limit)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1">
              {getUsageIcon()}
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                {Math.round(percent)}%
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              {formatCurrency(remaining)} left
            </span>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${percent}%`,
                backgroundColor: getStatusColor(),
              }}
            />
          </div>
        </div>

        {/* Footer - Status and Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <LuChartPie size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Monthly
            </span>
          </div>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isExceeded
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : isNearLimit
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            }`}
          >
            {getStatusText()}
          </span>
        </div>

        {/* Compact Warning - Only when needed */}
        {isExceeded && (
          <div className="mt-2 text-[10px] px-1.5 py-1 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-center">
            ⚠️ Over by {formatCurrency(spent - limit)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;

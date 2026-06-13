const HealthScore = ({ dashboardData }) => {
  const totalIncome = dashboardData?.totalIncome || 0;
  const totalExpense = dashboardData?.totalExpense || 0;

  const hasAnyRecords = totalIncome > 0 || totalExpense > 0;

  const spendingRatio =
    totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  let healthStatus = "grey";

  if (hasAnyRecords) {
    if (totalIncome === 0 && totalExpense > 0) {
      healthStatus = "red";
    } else if (spendingRatio >= 80) {
      healthStatus = "red";
    } else if (spendingRatio >= 70) {
      healthStatus = "yellow";
    } else {
      healthStatus = "green";
    }
  }

  return (
    <div>
      <div
        className={`p-4 rounded-lg text-xs border ${
          healthStatus === "green"
            ? "bg-green-50 border-green-200 text-green-700"
            : healthStatus === "yellow"
              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
              : healthStatus === "red"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-gray-50 border-gray-200 text-gray-700"
        }`}
      >
        {!hasAnyRecords ? (
          <>💬 Add income or expense to receive financial feedback.</>
        ) : totalIncome === 0 && totalExpense > 0 ? (
          <>
            🔴 Financial Health: Critical
            <br />
            You have expenses but no recorded income.
          </>
        ) : (
          <>
            {healthStatus === "green" && (
              <>
                🟢 Financial Health: Good
                <br />
                You've spent {spendingRatio.toFixed(1)}% of your income.
              </>
            )}

            {healthStatus === "yellow" && (
              <>
                🟡 Financial Health: Warning
                <br />
                You've spent {spendingRatio.toFixed(1)}% of your income. Try to
                reduce spending.
              </>
            )}

            {healthStatus === "red" && (
              <>
                🔴 Financial Health: Critical
                <br />
                You've spent {spendingRatio.toFixed(1)}% of your income.
                Expenses are too high.
              </>
            )}
          </>
        )}
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            healthStatus === "green"
              ? "bg-green-500"
              : healthStatus === "yellow"
                ? "bg-yellow-500"
                : healthStatus === "red"
                  ? "bg-red-500"
                  : "bg-gray-500"
          }`}
          style={{
            width: `${Math.min(
              totalIncome === 0 && totalExpense > 0 ? 100 : spendingRatio,
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

export default HealthScore;

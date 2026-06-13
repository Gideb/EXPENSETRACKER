import { addThousandsSeparator } from "../../utils/helper";
import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = ["#FF7F00", "#008000", "#FF0000", "#BF00FF", "#2F4F4F"];

const FinanceOverview = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  /* last30DaysExpense,
  last60DaysIncome, */
}) => {
  const balanceData = [
    { name: "Total Balance", amount: totalBalance },
    { name: "Total Income", amount: totalIncome },
    { name: "Total Expense", amount: totalExpenses },
 /*    { name: "Last 60 Days Income", amount: last60DaysIncome },
    { name: "Last 30 Days Expense", amount: last30DaysExpense }, */
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg dark:text-gray-100">Financial Overview</h5>
      </div>

      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={`GH₵${addThousandsSeparator(totalBalance)}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default FinanceOverview;

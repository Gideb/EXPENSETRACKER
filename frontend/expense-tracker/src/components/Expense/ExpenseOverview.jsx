import { useMemo } from "react";
import { prepareExpenseLineChartData } from "../../utils/helper";
import { LuPlus } from "react-icons/lu";
import CustomLineChart from "../Charts/CustomLineChart";

const ExpenseOverview = ({ transactions, onAddExpense }) => {
  const chartData = useMemo(
    () => prepareExpenseLineChartData(transactions),
    [transactions],
  );

  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div className="">
          <h5 className="text-lg">Expense Overview</h5>
          <p className="text-xs text-gray-400 mt-1">
            Track your spending trends over time and gain insights on where your
            money goes
          </p>
        </div>

        <button className=" add-btn mt-4 md:mt-0" onClick={onAddExpense}>
          <LuPlus className="text-lg" />
          Add Expense
        </button>
      </div>
      <div className="mt-10">
        <CustomLineChart type="expense" data={chartData} />
      </div>
    </div>
  );
};

export default ExpenseOverview;

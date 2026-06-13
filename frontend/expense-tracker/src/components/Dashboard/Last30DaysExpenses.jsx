import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart from "../Charts/CustomBarChart";

const Last30DaysExpenses = ({ data }) => {
  const chartData = prepareExpenseBarChartData(data);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100">Last 30 Days Expenses</h5>
          <p className="text-xs text-gray-400 mt-1">
            Breakdown of your expenses for the month.
          </p>
        </div>
      </div>

      <CustomBarChart type="expense" data={chartData} />
    </div>
  );
};
export default Last30DaysExpenses;

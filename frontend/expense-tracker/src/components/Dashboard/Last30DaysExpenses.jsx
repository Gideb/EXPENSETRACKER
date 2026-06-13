import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart from "../Charts/CustomBarChart";

const Last30DaysExpenses = ({ data }) => {
  const chartData = prepareExpenseBarChartData(data);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg dark:text-gray-100">Last 30 Days Expenses</h5>
      </div>

      <CustomBarChart type="expense" data={chartData} />
    </div>
  );
};
export default Last30DaysExpenses;

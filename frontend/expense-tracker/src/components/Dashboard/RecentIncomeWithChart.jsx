import { addThousandsSeparator } from "../../utils/helper";
import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = ["#FF7F00", "#008000", "#FF0000", "#BF00FF", "#2F4F4F"];

const RecentIncomeWithChart = ({ data, totalIncome }) => {
  const chartData = (data || []).map((item) => ({
    name: item?.source,
    amount: item?.amount,
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100">Last 60 Days Income</h5>
          <p className="text-xs text-gray-400 mt-1">
            Income sources for the past two months.
          </p>
        </div>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`GHS${addThousandsSeparator(totalIncome)}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default RecentIncomeWithChart;

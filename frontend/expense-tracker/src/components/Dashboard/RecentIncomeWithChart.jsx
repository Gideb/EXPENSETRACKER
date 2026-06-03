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
        <h5 className="text-lg">Last 60 Days Income</h5>
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

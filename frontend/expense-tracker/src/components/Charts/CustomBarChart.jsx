import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { addThousandsSeparator } from "../../utils/helper";

const CustomBarChart = ({ data, type }) => {
  const xAxisKey = type === "income" ? "month" : "category";
  const tooltipLabelKey = type === "income" ? "source" : "category";

  //function to alternate colors
  const getBarColor = (index) => {
    return type === "income"
      ? index % 2 === 0
        ? "#059403"
        : "#90FA73"
      : index % 2 === 0
        ? "#D90202"
        : "#f58282";
  };

  const renderBar = (props) => {
    const { index = 0 } = props;

    return <Rectangle {...props} fill={getBarColor(index)} />;
  };

  const CustomToolTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/50 backdrop-blur-md shadow-md rounded-lg p-2 border border-gray-200">
          <p className="text-xs font-semibold text-amber-700 mb-1">
            {payload[0].payload[tooltipLabelKey]}
          </p>
          <p className="text-sm text-gray-700">
            Amount:{" "}
            <span className="text-sm font-semibold text-gray-900">
              GHS{addThousandsSeparator(payload[0].payload.amount)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />

          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />

          <Tooltip content={CustomToolTip} />
          <Bar
            dataKey="amount"
            fill="#c942ff"
            radius={[10, 10, 0, 0]}
            activeStyle={{ fill: "green" }}
            shape={renderBar}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;

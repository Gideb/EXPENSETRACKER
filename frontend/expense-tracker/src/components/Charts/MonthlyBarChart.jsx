import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import CustomToolTip from '../Charts/MonthlyToolTip';
import CustomLegend from '../charts/CustomLegend';

const MonthlyBarChart = ({ data = [] }) => {
  return (
    <div className="w-full h-87.5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis dataKey="month" tick={{ fontSize: 12 }} />

          <YAxis tick={{ fontSize: 12 }} />

          <Tooltip content={<CustomToolTip />} />

          <Legend content={<CustomLegend />} />

          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />

          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;

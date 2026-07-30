import { addThousandsSeparator } from '../../utils/helper';

const MonthlyToolTip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg border p-3">
      <p className="font-semibold mb-2">{label}</p>

      {payload.map((item) => (
        <div key={item.dataKey} className="flex justify-between gap-6">
          <span style={{ color: item.color }}>{item.name}</span>

          <span>GH₵ {addThousandsSeparator(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default MonthlyToolTip;

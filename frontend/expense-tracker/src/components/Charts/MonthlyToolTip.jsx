import { addThousandsSeparator } from '../../utils/helper';

const MonthlyToolTip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-lg border border-gray-400 p-2">
      <p className="font-semibold mb-2 text-xs">{label}</p>

      {payload.map((item) => (
        <div key={item.dataKey} className="flex text-sm justify-between gap-2 ">
          <span style={{ color: item.color }} >{item.name}:</span>

          <span>GH₵ {addThousandsSeparator(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default MonthlyToolTip;

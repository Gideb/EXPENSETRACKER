import { addThousandsSeparator } from "../../utils/helper";

const CustomToolTip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/50 backdrop-blur-md shadow-md rounded-lg p-2 border border-gray-300">
        <p className="text-xs font-semibold mb-1 text-amber-800">
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-600">
          Amount:{" "}
          <span className="text-sm font-semibold text-gray-900">
            {" "}
            GH₵{addThousandsSeparator(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomToolTip;

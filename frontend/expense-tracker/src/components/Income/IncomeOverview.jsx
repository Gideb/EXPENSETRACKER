import { prepareIncomeBarChartData } from "../../utils/helper";
import { LuPlus } from "react-icons/lu";
import CustomBarChart from "../Charts/CustomBarChart";
import { useMemo } from "react";

const IncomeOverview = ({ transactions, onAddIncome }) => {
  const chartData = useMemo(
    () => prepareIncomeBarChartData(transactions),
    [transactions],
  );
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between  ">
        <div className="">
          <h5 className="text-lg dark:text-gray-100">Income Overview</h5>
          <p className="text-xs text-gray-400 mt-1">
            Track your earnings over time and analyze your income{" "}
          </p>
        </div>

        <button className=" add-btn my-4 md:my-0" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>
      <div className="mt-10">
        <CustomBarChart type="income" data={chartData} />
      </div>
    </div>
  );
};

export default IncomeOverview;

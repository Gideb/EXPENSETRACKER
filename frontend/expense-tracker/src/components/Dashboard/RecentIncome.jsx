import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const RecentIncome = ({ transactions, onSeeMore }) => {
  const hasTransactions = transactions?.length > 0;


  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100">Income</h5>
          <p className="text-xs text-gray-400 mt-1">
            View your recent income history.
          </p>
        </div>

        {hasTransactions && (
          <button className="card-btn group" onClick={onSeeMore}>
            See All
            <LuArrowRight className="text-base dark:text-gray-100 group-hover:translate-x-1 duration-300 transition-all ease-in-out" />
          </button>
        )}
      </div>

      <div className="mt-6">
        {hasTransactions ? (
        transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.source}
            date={moment(item.date).format("DD MM YYYY")}
            icon={item.icon}
            type="income"
            amount={addThousandsSeparator(item.amount)}
            hideDeleteBtn
          />
        ))) : (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">
              No income recorded in the last 60 days.
            </p>

            <button
              onClick={onSeeMore}
              className="mt-3 text-sm text-primary font-medium underline cursor-pointer"
            >
              Add a recent income
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentIncome;

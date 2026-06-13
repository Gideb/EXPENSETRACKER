import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const RecentTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100">Recent Transactions</h5>
          <p className="text-xs text-gray-400 mt-1">
            View your recent conbined transaction history
          </p>
        </div>
        <button className="card-btn group" onClick={onSeeMore}>
          See All{" "}
          <LuArrowRight className="text-base dark:text-gray-100 group-hover:translate-x-1 duration-300 transition-all ease-in-out" />
        </button>
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.type == "expense" ? item.category : item.source}
            icon={item.icon}
            date={moment(item.date).format("DD MM YYYY")}
            amount={addThousandsSeparator(item.amount)}
            type={item.type}
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;

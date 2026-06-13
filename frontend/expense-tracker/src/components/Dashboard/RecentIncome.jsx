import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const RecentIncome = ({ transactions, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg dark:text-gray-100">Income</h5>

        <button className="card-btn group" onClick={onSeeMore}>
          See All
          <LuArrowRight className="text-base dark:text-gray-100 group-hover:translate-x-1 duration-300 transition-all ease-in-out" />
        </button>
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.source}
            date={moment(item.date).format("DD MM YYYY")}
            icon={item.icon}
            type="income"
            amount={addThousandsSeparator(item.amount)}
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentIncome;

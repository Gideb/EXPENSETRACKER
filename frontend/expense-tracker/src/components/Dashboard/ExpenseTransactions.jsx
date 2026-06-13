import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const ExpenseTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100">Expenses</h5>
          <p className="text-xs text-gray-400 mt-1">
            View your recent expense history.
          </p>
        </div>

        <button className="card-btn group" onClick={onSeeMore}>
          See All{" "}
          <LuArrowRight className="text-base dark:text-gray-100 group-hover:translate-x-1 duration-300 transition-all ease-in-out" />
        </button>
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((expense) => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.category}
            icon={expense.icon}
            date={moment(expense.date).format("DD MM YYYY")}
            amount={addThousandsSeparator(expense.amount)}
            type="expense"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseTransactions;

import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const ExpenseList = ({ transactions, onDelete,handleEditExpense, onDownload }) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100 ">Expenses</h5>
          <p className="text-xs text-gray-400 mt-1">
            Track and reiew all your expenses in one place.
          </p>
        </div>

        <button className="card-btn my-4 group" onClick={onDownload}>
          <LuDownload className="text-base group-hover:-translate-y-0.5 duration-300 transition-all ease-in-out" />{" "}
          Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((expense) => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.category}
            amount={addThousandsSeparator(expense.amount)}
            date={moment(expense.date).format("DD MMM YYYY")}
            icon={expense.icon}
            type="expense"
            onEdit={() => handleEditExpense(expense)}
            onDelete={() => onDelete(expense)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;

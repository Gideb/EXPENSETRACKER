import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const ExpenseList = ({ transactions, onDelete,handleEdit, onDownload }) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <h5 className="text-lg">All Expenses</h5>

        <button className="card-btn my-4 md:my-0" onClick={onDownload}>
          <LuDownload className="text-base" /> Download Data
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
            onEdit={() => handleEdit(expense)}
            onDelete={() => onDelete(expense)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;

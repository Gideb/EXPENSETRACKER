import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const BudgetList = ({
  transactions,
  onDelete,
  handleEditBudget,
  onDownload,
}) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100 ">Budgets</h5>
          <p className="text-xs text-gray-400 mt-1">
            Track and review all your budgets in one place.
          </p>
        </div>

        {/* <button className="card-btn my-4 group" onClick={onDownload}>
          <LuDownload className="text-base group-hover:-translate-y-0.5 duration-300 transition-all ease-in-out" />{" "}
          Download
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((budget) => (
          <TransactionInfoCard
            key={budget._id}
            title={budget.category}
            amount={addThousandsSeparator(budget.limitAmount)} 
            date={moment(budget.month).format("MMMM YYYY")} 
            icon={budget.icon}
            type="budget"
            onEdit={() => handleEditBudget(budget)}
            onDelete={() => onDelete(budget)}
          />
        ))}
      </div>
    </div>
  );
};

export default BudgetList;

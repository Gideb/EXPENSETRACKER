import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";

const IncomeList = ({
  transactions,
  onDelete,
  handleEditIncome,
  onDownload,
}) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100 ">Income Transactions</h5>
          <p className="text-xs text-gray-400 mt-1">
            View your complete income transaction history.
          </p>
        </div>
        
        <div>
          <button className="card-btn my-4 group" onClick={onDownload}>
            <LuDownload className="text-base group-hover:-translate-y-0.5 duration-300 transition-all ease-in-out" />{" "}
            Download PDF
          </button>
          <button className="card-btn my-4 group" onClick={onDownload}>
            <LuDownload className="text-base group-hover:-translate-y-0.5 duration-300 transition-all ease-in-out" />{" "}
            Download EXCEL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((income) => (
          <TransactionInfoCard
            key={income._id}
            transaction={income}
            title={income.source}
            amount={addThousandsSeparator(income.amount)}
            date={moment(income.date).format("DD MMM YYYY")}
            icon={income.icon}
            type="income"
            onEdit={handleEditIncome}
            onDelete={() => onDelete(income)}
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;

import { LuDownload } from "react-icons/lu";
import moment from "moment";
import TransactionCard from "../Cards/TransactionCard";
import { addThousandsSeparator } from "../../utils/helper";

const TransactionList = ({
  transactions,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div>
          <h5 className="text-lg">Transaction History</h5>

          <p className="text-xs text-gray-400 mt-1">
            See all your transactions over time in one place
          </p>
        </div>

        <button className="card-btn my-4 md:my-0" onClick={onDownload}>
          <LuDownload className="text-base" /> Download Data
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((item) => (
          <TransactionCard
            key={item._id}
            title={item.type === "expense" ? item.category : item.source}
            icon={item.icon}
            date={moment(item.date).format("DD MM YYYY")}
            amount={addThousandsSeparator(item.amount)}
            type={item.type}
            onDelete={() => onDelete(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;

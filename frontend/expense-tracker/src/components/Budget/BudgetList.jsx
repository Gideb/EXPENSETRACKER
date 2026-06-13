import BudgetCard from "../Cards/BudgetCard";

const BudgetList = ({ budgets, onDelete, handleEditBudget }) => {
  return (
    <div className="card">
      <div className="inline md:flex items-center justify-between">
        <div>
          <h5 className="text-lg dark:text-gray-100 ">Budgets</h5>
          <p className="text-xs text-gray-400 mt-1">
            Track and review all your budgets in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {budgets?.map((budget) => (
          <BudgetCard
            key={budget._id}
            budget={budget}
            icon={budget.icon}
            onEdit={() => handleEditBudget(budget)}
            onDelete={() => onDelete(budget)}
          />
        ))}
      </div>
    </div>
  );
};

export default BudgetList;

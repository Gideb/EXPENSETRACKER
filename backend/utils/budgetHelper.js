const Budget = require("../models/Budget");

const updateBudgetOnExpense = async ({ userId, category, amount, month }) => {
  const budget = await Budget.findOne({
    userId,
    category,
    month,
  });

  if (!budget) {
    return {
      found: false,
    };
  }

  // update spent amount
  budget.spentAmount += amount;

  // check if exceeded
  if (budget.spentAmount > budget.limitAmount) {
    budget.isExceeded = true;
  }

  await budget.save();

  return {
    found: true,
    isExceeded: budget.isExceeded,
    budget,
  };
};

module.exports = updateBudgetOnExpense;

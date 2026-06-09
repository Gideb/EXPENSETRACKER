import { useEffect, useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddExpenseForm = ({ onAddExpense, onUpdateExpense, editData }) => {
  const [income, setIncome] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });

  useEffect(() => {
    if (!editData) return;

    setIncome((prev) => {
      const d = editData.date ? new Date(editData.date) : null;
      const normalizedDate =
        d && !Number.isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";

      return {
        ...prev,
        category: editData.category || "",
        amount:
          editData.amount !== undefined && editData.amount !== null
            ? editData.amount
            : "",
        date: normalizedDate,
        icon: editData.icon || "",
      };
    });
  }, [editData]);

  const handleChange = (key, value) => setIncome({ ...income, [key]: value });

  return (
    <div>
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={income.category}
        onChange={({ target }) => handleChange("category", target.value)}
        label="Expense Category"
        placeholder="Food, Fees, Fuel"
        type="text"
      />

      <Input
        value={income.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label=" Amount"
        placeholder="Enter Amount"
        type="number"
      />

      <Input
        label="Date"
        placeholder="Select date"
        type="date"
       
        value={income.date}
        onChange={({ target }) => handleChange("date", target.value)}
      />

      <div className="flex justify-end mt-6 ">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() =>
            editData ? onUpdateExpense(income) : onAddExpense(income)
          }
        >
          {editData ? "Update Expense" : "Add Expense"}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;

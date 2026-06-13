import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddBudgetForm = ({ onBudgetAdded, onUpdateBudget, editData }) => {
  const [budget, setBudget] = useState({
    category: "",
    limitAmount: "",
    month: "",
    icon: "",
  });

  useEffect(() => {
    if (!editData) return;

    setBudget((prev) => ({
      ...prev,
      category: editData.category || "",
      limitAmount:
        editData.limitAmount !== undefined && editData.limitAmount !== null
          ? editData.limitAmount
          : "",
      month: editData.month || "",
      icon: editData.icon || "",
    }));
  }, [editData]);

  const handleChange = (key, value) => setBudget({ ...budget, [key]: value });

  const handleSubmit = () => {
    if (editData) {
      onUpdateBudget?.(budget);
    } else {
      onBudgetAdded?.(budget);
    }
  };

  const isFormValid = budget.category && budget.limitAmount && budget.month;

  // Get current year-month for min attribute
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div>
      <EmojiPickerPopup
        icon={budget.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={budget.category}
        onChange={({ target }) => handleChange("category", target.value)}
        label="Category"
        placeholder="e.g., Food, Transport, Entertainment"
        type="text"
      />

      <Input
        value={budget.limitAmount}
        onChange={({ target }) => handleChange("limitAmount", target.value)}
        label="Budget Amount"
        placeholder="Enter amount"
        type="number"
        min="0"
        step="0.01"
      />

      <Input
        label="Month"
        placeholder="Select month"
        type="month"
        min={currentMonth}
        value={budget.month}
        onChange={({ target }) => handleChange("month", target.value)}
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
          disabled={!isFormValid}
          style={{
            opacity: !isFormValid ? 0.6 : 1,
            cursor: !isFormValid ? "not-allowed" : "pointer",
          }}
        >
          {editData ? "Update Budget" : "Add Budget"}
        </button>
      </div>
    </div>
  );
};

export default AddBudgetForm;

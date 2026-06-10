import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddIncomeForm = ({ onAddIncome, onUpdateIncome, editData }) => {
  const [income, setIncome] = useState({
    source: "",
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
        source: editData.source || "",
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
        value={income.source}
        onChange={({ target }) => handleChange("source", target.value)}
        label="Income Source"
        placeholder="Freelance, Salary, Gift"
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
        max={new Date().toISOString().split("T")[0]}
        
        value={income.date}
        onChange={({ target }) => handleChange("date", target.value)}
      />

      <div className="flex justify-end mt-6 ">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() =>
            editData ? onUpdateIncome(income) : onAddIncome(income)
          }
        >
          {editData ? "Update Income" : "Add Income"}
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
